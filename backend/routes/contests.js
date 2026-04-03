const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const ContestSubmission = require('../models/ContestSubmission');
const auth = require('../middleware/auth');

// Get current contest (or latest finished one)
router.get('/current', async (req, res) => {
    try {
        let contest = await Contest.findOne({ active: true }).sort({ createdAt: -1 });

        // Fallback to the most recent contest if no active one exists
        if (!contest) {
            contest = await Contest.findOne({}).sort({ createdAt: -1 });
        }

        if (!contest) {
            return res.status(404).json({ msg: 'No contest found' });
        }
        res.json(contest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Checks if user has already submitted to a contest
router.get('/my-submission/:contestId', auth, async (req, res) => {
    try {
        const submission = await ContestSubmission.findOne({
            contest: req.params.contestId,
            user: req.user.id
        });
        res.json(submission);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Submit a story to a contest
router.post('/submit', auth, async (req, res) => {
    const { contestId, content } = req.body;

    try {
        // Check if contest exists and is active
        const contest = await Contest.findById(contestId);
        if (!contest || !contest.active) {
            return res.status(400).json({ msg: 'Invalid or inactive contest' });
        }

        // Check if deadline has passed
        if (new Date() > new Date(contest.deadline)) {
            return res.status(400).json({ msg: 'Contest has ended' });
        }

        // Check if user already submitted
        let submission = await ContestSubmission.findOne({
            contest: contestId,
            user: req.user.id
        });

        if (submission) {
            return res.status(400).json({ msg: 'You have already submitted a story for this contest' });
        }

        const wordCount = (content || '').trim().split(/\s+/).filter(Boolean).length;
        if (wordCount > 200) {
            return res.status(400).json({ msg: 'Contest submission cannot exceed 200 words.' });
        }

        submission = new ContestSubmission({
            contest: contestId,
            user: req.user.id,
            content
        });

        await submission.save();
        res.json(submission);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all submissions for a specific user
router.get('/user/:userId/submissions', async (req, res) => {
    try {
        const submissions = await ContestSubmission.find({ user: req.params.userId })
            .populate('contest', 'title active deadline votingDeadline')
            .sort({ createdAt: -1 });
        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all submissions for a contest
router.get('/:contestId/submissions', async (req, res) => {
    try {
        const submissions = await ContestSubmission.find({ contest: req.params.contestId })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Vote for a story
router.post('/vote/:submissionId', auth, async (req, res) => {
    try {
        const submission = await ContestSubmission.findById(req.params.submissionId).populate('contest');
        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }

        const now = new Date();
        const contest = submission.contest;

        // Check if contest is in voting period
        if (now < new Date(contest.deadline)) {
            return res.status(400).json({ msg: 'Voting has not started yet' });
        }
        if (now > new Date(contest.votingDeadline)) {
            return res.status(400).json({ msg: 'Voting has ended' });
        }

        // User cannot vote for their own story
        if (submission.user.toString() === req.user.id) {
            return res.status(400).json({ msg: 'You cannot vote for your own story' });
        }

        // Toggle vote
        const voteIndex = submission.votes.indexOf(req.user.id);
        if (voteIndex === -1) {
            submission.votes.push(req.user.id);
        } else {
            submission.votes.splice(voteIndex, 1);
        }

        await submission.save();
        res.json({ votes: submission.votes, hasVoted: voteIndex === -1 });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get leaderboard (Global/Cumulative)
router.get('/leaderboard', async (req, res) => {
    try {
        const User = require('../models/User');
        const Story = require('../models/Story');
        const ContestSubmission = require('../models/ContestSubmission');

        // Use a single aggregation for speed and reliability
        const leaderboard = await User.aggregate([
            {
                // Join with all-time Story upvotes
                $lookup: {
                    from: 'stories',
                    localField: '_id',
                    foreignField: 'author',
                    as: 'userStories'
                }
            },
            {
                // Join with all-time Contest Submissions
                $lookup: {
                    from: 'contestsubmissions',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'userSubmissions'
                }
            },
            {
                $project: {
                    username: 1,
                    profilePicture: 1,
                    rank: 1,
                    // Sum upvotes from all stories
                    storyUpvotes: {
                        $reduce: {
                            input: "$userStories",
                            initialValue: 0,
                            in: { $add: ["$$value", { $size: { $ifNull: ["$$this.upvotes", []] } }] }
                        }
                    },
                    // Sum upvotes from all contest submissions
                    contestUpvotes: {
                        $reduce: {
                            input: "$userSubmissions",
                            initialValue: 0,
                            in: { $add: ["$$value", { $size: { $ifNull: ["$$this.votes", []] } }] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    finalScore: { $add: ["$storyUpvotes", "$contestUpvotes"] }
                }
            },
            // Filter out users with zero global influence to keep leaderboard clean
            { $match: { finalScore: { $gt: 0 } } },
            // Sort by highest score, then by contest performance
            { $sort: { finalScore: -1, contestUpvotes: -1 } }
        ]);

        // Add rank after sorting
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1,
            user: {
                _id: entry._id,
                username: entry.username,
                profilePicture: entry.profilePicture,
                rank: entry.rank
            }
        }));

        res.json(rankedLeaderboard);
    } catch (err) {
        console.error('Leaderboard error:', err.message);
        res.status(500).send('Server Error');
    }
});

// Helper function to get the winner of a specific contest
async function getWinnerOfContest(contest) {
    const submissions = await ContestSubmission.find({ contest: contest._id })
        .populate('user', '_id')
        .populate('contest', 'title');

    if (submissions.length === 0) return null;

    // Map scores (votes on that submission)
    const scores = submissions.map(sub => ({
        userId: sub.user._id.toString(),
        votes: sub.votes.length
    }));

    // Sort by votes
    scores.sort((a, b) => b.votes - a.votes);

    // Return the user with most votes for this specific contest
    return scores.length > 0 ? scores[0].userId : null;
}

// Check for 3 consecutive wins and author rank upgrade
router.get('/check-streak', auth, async (req, res) => {
    try {
        const User = require('../models/User');
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) return res.status(404).json({ msg: 'User not found' });

        // If user is already author, no need to upgrade
        if (currentUser.rank === 'author') {
            return res.json({ upgraded: false });
        }

        // Find last 3 finished contests
        const endedContests = await Contest.find({ votingDeadline: { $lt: new Date() } })
            .sort({ votingDeadline: -1 })
            .limit(3);

        if (endedContests.length < 3) {
            return res.json({ upgraded: false, reason: 'Not enough ended contests yet' });
        }

        let wonAll = true;
        for (let contest of endedContests) {
            const winnerId = await getWinnerOfContest(contest);
            if (winnerId !== req.user.id) {
                wonAll = false;
                break;
            }
        }

        if (wonAll) {
            currentUser.rank = 'author';
            await currentUser.save();

            const Notification = require('../models/Notification');
            await Notification.create({
                recipient: currentUser._id,
                type: 'rank_upgrade',
                message: 'Incredible! You have placed 1st in 3 consecutive contests and earned the title of Author!',
                link: `/profile/${currentUser._id}`
            });

            return res.json({ upgraded: true, newRank: 'author' });
        }

        return res.json({ upgraded: false });
    } catch (err) {
        console.error('Streak check error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/contests/submission/:id/likers
// @desc    Get populated list of users who liked an entry
// @access  Private
router.get('/submission/:id/likers', auth, async (req, res) => {
    try {
        const submission = await ContestSubmission.findById(req.params.id)
            .populate('votes', 'username profilePicture rank');

        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }

        res.json(submission.votes);
    } catch (err) {
        console.error('Submission likers fetch error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
