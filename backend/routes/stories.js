const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification'); // ADD THIS
const upload = require('../middleware/upload');

// POST: Create a new story
router.post('/', [auth, upload.single('headerImage')], async (req, res) => {
  try {
    if (!req.body || (Object.keys(req.body).length === 0 && !req.file)) {
      return res.status(400).json({ msg: 'Request body is missing' });
    }

    const { title, content, genre } = req.body;
    const headerImage = req.file ? req.file.path : null;

    if (!title || !content) {
      return res.status(400).json({ msg: 'Please provide both a title and content.' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const newStory = new Story({
      title,
      genre: genre || 'General',
      headerImage,
      author: req.user.id,
      authorRank: user.rank,
      segments: [
        {
          content: content,
          author: req.user.id
        }
      ]
    });

    const savedStory = await newStory.save();
    await savedStory.populate('author', 'username rank profilePicture');
    res.json(savedStory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET: Fetch all stories
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture');
    res.json(stories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET: Fetch all stories related to a specific user
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Fetching stories related to User ID: ${userId}`);

    const stories = await Story.find({
      $or: [
        { author: userId },
        { 'segments.author': userId }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username rank profilePicture')
      .populate('segments.author', 'username rank profilePicture');

    console.log(`Found ${stories.length} stories for user ${userId}`);
    res.json(stories);
  } catch (err) {
    console.error('Backend user stories error:', err);
    res.status(500).send('Server Error');
  }
});

// POST: Add segment to story
router.post('/segment/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ msg: 'Story not found' });

    if (story.isPaused) {
      return res.status(403).json({ msg: 'Story is paused by the author' });
    }

    const User = require('../models/User');
    const currentUser = await User.findById(req.user.id);

    if (story.authorRank === 'master' && currentUser.rank === 'beginner') {
      return res.status(403).json({ msg: 'Only Masters can continue this story.' });
    }

    const newSegment = {
      content: req.body.content,
      author: req.user.id
    };

    story.segments.push(newSegment);
    await story.save();

    // CREATE NOTIFICATION for story continuation
    if (story.author.toString() !== req.user.id) {
      await Notification.create({
        recipient: story.author,
        sender: req.user.id,
        type: 'story_continuation',
        story: story._id,
        message: `${currentUser.username} continued your story "${story.title}"`,
        link: `/story/${story._id}`
      });
    }

    const updatedStory = await Story.findById(req.params.id)
      .populate('segments.author', 'username profilePicture')
      .populate('author', 'username profilePicture');

    res.json(updatedStory);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// PUT: Toggle Pause
router.put('/pause/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (story.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    story.isPaused = !story.isPaused;
    await story.save();
    res.json(story);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET: Get Single Story
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'username rank profilePicture')
      .populate('segments.author', 'username rank profilePicture');

    if (!story) return res.status(404).json({ msg: 'Story not found' });

    res.json(story);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Story not found' });
    res.status(500).send('Server Error');
  }
});

// PUT: Like/Unlike story with NOTIFICATION
router.put('/like/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ msg: 'Story not found' });
    }

    // Prevent self-upvoting
    if (story.author.toString() === req.user.id) {
      return res.status(403).json({ msg: 'You cannot upvote your own story' });
    }

    const alreadyLiked = story.upvotes.filter(like => like.toString() === req.user.id).length > 0;

    if (alreadyLiked) {
      // Unlike
      const removeIndex = story.upvotes.map(like => like.toString()).indexOf(req.user.id);
      story.upvotes.splice(removeIndex, 1);
    } else {
      // Like
      story.upvotes.unshift(req.user.id);

      // CREATE NOTIFICATION
      const User = require('../models/User');
      const liker = await User.findById(req.user.id);

      await Notification.create({
        recipient: story.author,
        sender: req.user.id,
        type: 'like',
        story: story._id,
        message: `${liker.username} liked your story "${story.title}"`,
        link: `/`
      });
    }

    await story.save();
    res.json(story.upvotes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
