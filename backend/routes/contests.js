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

// Check if user has already submitted to a contest
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

module.exports = router;
