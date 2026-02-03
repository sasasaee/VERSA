const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @route   GET /api/users/profile/:userId
// @desc    Get user profile by ID
// @access  Public
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const storiesStarted = await Story.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username rank profilePicture');

    const storiesContributed = await Story.find({
      'segments.author': req.params.userId,
      author: { $ne: req.params.userId }
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username rank profilePicture');

    res.json({
      user,
      stats: {
        storiesStarted: storiesStarted.length,
        storiesContributed: storiesContributed.length,
        contestsParticipated: user.contestsParticipated
      },
      storiesStarted,
      storiesContributed
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { bio, contestsParticipated, username } = req.body;
    
    const updateFields = {};
    if (bio !== undefined) updateFields.bio = bio;
    if (contestsParticipated !== undefined) updateFields.contestsParticipated = contestsParticipated;
    if (username !== undefined) updateFields.username = username;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Username already taken' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/profile/picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile/picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profilePicture: req.file.path } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
