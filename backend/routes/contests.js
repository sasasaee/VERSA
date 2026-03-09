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

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        // 1. Get the latest active contest (or most recent if none active)
        const latestContest = await Contest.findOne({ active: true }).sort({ createdAt: -1 });
        let contest = latestContest;

        if (!contest) {
            contest = await Contest.findOne({}).sort({ createdAt: -1 });
        }

        if (!contest) {
            return res.json([]);
        }

        // 2. Get all submissions for this contest
        const submissions = await ContestSubmission.find({ contest: contest._id })
            .populate('user', 'username profilePicture')
            .populate('contest', 'title');

        // 3. Aggregate user scores from the contest
        const userScores = {};
        submissions.forEach(sub => {
            const userId = sub.user._id.toString();
            if (!userScores[userId]) {
                userScores[userId] = {
                    user: sub.user,
                    contestUpvotes: 0,
                    submissionTitle: sub.content.substring(0, 30) // Use snippet as title
                };
            }
            userScores[userId].contestUpvotes += sub.votes.length;
        });

        // 4. Calculate Contribution Bonus (Platform-wide)
        const User = require('../models/User');
        const Story = require('../models/Story');

        const allUsers = await User.find({}, 'username');
        let maxPlatformUpvotes = -1;
        let bonusUserId = null;

        const platformStats = await Promise.all(allUsers.map(async (u) => {
            const stories = await Story.find({ author: u._id });
            const subs = await ContestSubmission.find({ user: u._id });

            const totalStoryUpvotes = stories.reduce((sum, s) => sum + (s.upvotes?.length || 0), 0);
            const totalSubUpvotes = subs.reduce((sum, s) => sum + (s.votes?.length || 0), 0);

            const total = totalStoryUpvotes + totalSubUpvotes;
            return { userId: u._id.toString(), total };
        }));

        platformStats.forEach(p => {
            if (p.total > maxPlatformUpvotes && p.total > 0) {
                maxPlatformUpvotes = p.total;
                bonusUserId = p.userId;
            }
        });

        // 5. Finalize scores
        const leaderboard = Object.values(userScores).map(entry => {
            const userId = entry.user._id.toString();
            const hasBonus = userId === bonusUserId;
            const finalScore = entry.contestUpvotes + (hasBonus ? 5 : 0);

            return {
                ...entry,
                bonus: hasBonus ? 5 : 0,
                finalScore,
                title: entry.submissionTitle
            };
        });

        // 6. Sort
        leaderboard.sort((a, b) => b.finalScore - a.finalScore || b.contestUpvotes - a.contestUpvotes);

        // Add Rank
        leaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        res.json(leaderboard);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
