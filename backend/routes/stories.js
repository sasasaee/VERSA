const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');

// POST: Create a new story
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, genre, headerImage } = req.body;

    const User = require('../models/User'); // Import User
    const user = await User.findById(req.user.id);

    const newStory = new Story({
      title,
      genre,
      headerImage,
      author: req.user.id,
      authorRank: user.rank,
      segments: [
        {
          content: content, // The starting text
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

router.post('/segment/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ msg: 'Story not found' });

    // Check if Paused
    if (story.isPaused) {
      return res.status(403).json({ msg: 'Story is paused by the author' });
    }

    // Check Permissions (Master vs Beginner)
    // We need the current user's rank. 
    const User = require('../models/User'); // Import User model
    const currentUser = await User.findById(req.user.id);

    if (story.authorRank === 'master' && currentUser.rank === 'beginner') {
      return res.status(403).json({ msg: 'Only Masters can continue this story.' });
    }

    // Add Segment
    const newSegment = {
      content: req.body.content,
      author: req.user.id
    };

    story.segments.push(newSegment);
    await story.save();

    // Return the updated story with populated authors
    const updatedStory = await Story.findById(req.params.id)
      .populate('segments.author', 'username profilePicture')
      .populate('author', 'username profilePicture');

    res.json(updatedStory);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// NEW: Toggle Pause (Owner Only)
router.put('/pause/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    // Check ownership
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

//Get Single Story (Full View)
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'username rank profilePicture')
      .populate('segments.author', 'username rank profilePicture'); // Get rank for segment authors too

    if (!story) return res.status(404).json({ msg: 'Story not found' });

    res.json(story);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Story not found' });
    res.status(500).send('Server Error');
  }
});

router.put('/like/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ msg: 'Story not found' });
    }

    // Check if the story has already been liked by this user
    if (story.upvotes.filter(like => like.toString() === req.user.id).length > 0) {
      // Get remove index
      const removeIndex = story.upvotes.map(like => like.toString()).indexOf(req.user.id);
      story.upvotes.splice(removeIndex, 1);
    } else {
      // Add user id to upvotes array
      story.upvotes.unshift(req.user.id);
    }

    await story.save();
    res.json(story.upvotes); // Return only the upvotes array
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;