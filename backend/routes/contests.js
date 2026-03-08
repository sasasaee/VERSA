const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const ContestSubmission = require('../models/ContestSubmission');
const auth = require('../middleware/auth');

// Get current active contest
router.get('/current', async (req, res) => {
    try {
        const contest = await Contest.findOne({ active: true }).sort({ createdAt: -1 });
        if (!contest) {
            return res.status(404).json({ msg: 'No active contest found' });
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

module.exports = router;
