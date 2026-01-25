const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');

// POST: Create a new story
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, genre, headerImage } = req.body;

    const newStory = new Story({
      title,
      genre,
      headerImage,
      author: req.user.id,
      segments: [
        {
          content: content, // The starting text
          author: req.user.id
        }
      ]
    });

    const savedStory = await newStory.save();
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
      .populate('author', 'username'); 
    res.json(stories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;