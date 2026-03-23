const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
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
    // If user is a 'reader', upgrade to 'beginner' before saving story
    let rankUpgraded = false;
    if (user.rank === 'reader') {
      user.rank = 'beginner';
      await user.save();
      rankUpgraded = true;

      // Create rank upgrade notification
      await Notification.create({
        recipient: req.user.id,
        type: 'rank_upgrade',
        message: 'Congratulations! Your title has been upgraded from Reader to Beginner.',
        link: `/profile/${req.user.id}`
      });
    }

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
    res.json({ ...savedStory._doc, rankUpgraded });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET: Search stories
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const regex = new RegExp(q, 'i');

    // Find users matching username
    const User = require('../models/User');
    const users = await User.find({ username: regex }).select('_id');
    const userIds = users.map(u => u._id);

    const stories = await Story.find({
      $or: [
        { title: regex },
        { genre: regex },
        { author: { $in: userIds } }
      ]
    })
      .populate('author', 'username rank profilePicture')
      .sort({ createdAt: -1 });

    res.json(stories);
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
      .populate('author', 'username rank profilePicture');
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

    if (story.authorRank === 'master' && currentUser.rank !== 'master') {
      return res.status(403).json({ msg: 'Only Masters can continue this story.' });
    }

    // Update user rank from 'reader' to 'beginner' if needed
    let rankUpgraded = false;
    if (currentUser.rank === 'reader') {
      currentUser.rank = 'beginner';
      await currentUser.save();
      rankUpgraded = true;

      // Create rank upgrade notification
      await Notification.create({
        recipient: req.user.id,
        type: 'rank_upgrade',
        message: 'Congratulations! Your title has been upgraded from Reader to Beginner.',
        link: `/profile/${req.user.id}`
      });
    }

    const newSegment = {
      content: req.body.content,
      author: req.user.id
    };

    story.segments.push(newSegment);
    await story.save();

    // CREATE NOTIFICATION for story continuation
    if (story.author.toString() !== req.user.id) {
      // Find existing notification
      let existingNotif = await Notification.findOne({
        recipient: story.author,
        type: 'story_continuation',
        story: story._id
      });

      // Calculate number of unique contributors excluding the author
      const uniqueContributors = new Set(
        story.segments
          .filter(s => s.author.toString() !== story.author.toString())
          .map(s => s.author.toString())
      );
      const count = uniqueContributors.size;

      const message = count > 1
        ? `${currentUser.username} and ${count - 1} other${count - 1 === 1 ? '' : 's'} continued your story "${story.title}"`
        : `${currentUser.username} continued your story "${story.title}"`;

      if (existingNotif) {
        existingNotif.message = message;
        existingNotif.sender = req.user.id; // Update sender to latest
        existingNotif.isRead = false;
        existingNotif.createdAt = Date.now();
        await existingNotif.save();
      } else {
        await Notification.create({
          recipient: story.author,
          sender: req.user.id,
          type: 'story_continuation',
          story: story._id,
          message: message,
          link: `/story/${story._id}`
        });
      }
    }

    const updatedStory = await Story.findById(req.params.id)
      .populate('segments.author', 'username rank profilePicture')
      .populate('author', 'username rank profilePicture');

    res.json({ ...updatedStory._doc, rankUpgraded });

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

      let existingNotif = await Notification.findOne({
        recipient: story.author,
        type: 'like',
        story: story._id
      });

      await story.populate('upvotes', 'username');

      const count = story.upvotes.length;
      let message = '';

      if (count === 1) {
        message = `${story.upvotes[0].username} liked your story.`;
      } else if (count === 2) {
        message = `${story.upvotes[0].username} and ${story.upvotes[1].username} liked your story.`;
      } else if (count >= 3) {
        message = `${story.upvotes[0].username}, ${story.upvotes[1].username}, and ${count - 2} others liked your story.`;
      }

      if (existingNotif) {
        existingNotif.message = message;
        existingNotif.sender = req.user.id;
        existingNotif.isRead = false;
        existingNotif.createdAt = Date.now();
        await existingNotif.save();
      } else {
        await Notification.create({
          recipient: story.author,
          sender: req.user.id,
          type: 'like',
          story: story._id,
          message: message,
          link: `/`
        });
      }
    }

    await story.save();
    res.json(story.upvotes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST: Save/Unsave Story
router.post('/save/:id', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const storyId = req.params.id;
    const isSaved = user.savedStories.some(id => id.toString() === storyId);

    if (isSaved) {
      // Unsave
      user.savedStories = user.savedStories.filter(id => id.toString() !== storyId);
    } else {
      // Save
      user.savedStories.push(storyId);
    }

    await user.save();
    res.json({ isSaved: !isSaved, savedStories: user.savedStories });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST: Save/Unsave a specific segment
router.post('/save-segment/:storyId/:segmentId', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const { segmentId } = req.params;
    const isSaved = user.savedSegments.some(id => id.toString() === segmentId);

    if (isSaved) {
      user.savedSegments = user.savedSegments.filter(id => id.toString() !== segmentId);
    } else {
      user.savedSegments.push(segmentId);
    }

    await user.save();
    res.json({ isSaved: !isSaved, savedSegments: user.savedSegments });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE: Delete a story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ msg: 'Story not found' });

    // Check if the user is the original author
    if (story.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this story' });
    }

    await Story.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Story removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Story not found' });
    res.status(500).send('Server Error');
  }
});

// DELETE: Delete a segment (contribution)
router.delete('/segment/:storyId/:segmentId', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ msg: 'Story not found' });

    // Find the segment
    const segmentIndex = story.segments.findIndex(s => s._id.toString() === req.params.segmentId);
    if (segmentIndex === -1) return res.status(404).json({ msg: 'Segment not found' });

    // Check if the user is the author of the segment
    if (story.segments[segmentIndex].author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this contribution' });
    }

    // Don't allow deleting the first segment via this route? 
    // Actually, if they delete the first segment, the story has no content.
    // The user said "you can delete my stories too", so maybe story delete is for the first segment.
    if (segmentIndex === 0) {
      return res.status(400).json({ msg: 'To delete the original story, use the story delete option.' });
    }

    story.segments.splice(segmentIndex, 1);
    await story.save();

    const updatedStory = await Story.findById(req.params.storyId)
      .populate('segments.author', 'username rank profilePicture')
      .populate('author', 'username rank profilePicture');

    res.json(updatedStory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT: Edit story title/content (first segment) - story author only
router.put('/edit/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ msg: 'Story not found' });

    // Only original story author can edit title
    if (story.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to edit this story' });
    }

    const { title, genre } = req.body;
    if (title) story.title = title;
    if (genre) story.genre = genre;

    // Also update first segment content if provided
    if (req.body.content && story.segments.length > 0) {
      story.segments[0].content = req.body.content;
      story.segments[0].editedAt = new Date();
    }

    await story.save();

    const updatedStory = await Story.findById(req.params.id)
      .populate('author', 'username rank profilePicture')
      .populate('segments.author', 'username rank profilePicture');

    res.json(updatedStory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT: Edit a specific segment - segment author only
router.put('/segment/edit/:storyId/:segmentId', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ msg: 'Story not found' });

    const segment = story.segments.id(req.params.segmentId);
    if (!segment) return res.status(404).json({ msg: 'Segment not found' });

    // Only segment author can edit it
    if (segment.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to edit this segment' });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ msg: 'Content cannot be empty' });
    }

    segment.content = content;
    segment.editedAt = new Date();

    await story.save();

    const updatedStory = await Story.findById(req.params.storyId)
      .populate('author', 'username rank profilePicture')
      .populate('segments.author', 'username rank profilePicture');

    res.json(updatedStory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT: Like/Unlike a specific segment
router.put('/segment/like/:storyId/:segmentId', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ msg: 'Story not found' });

    const segment = story.segments.id(req.params.segmentId);
    if (!segment) return res.status(404).json({ msg: 'Segment not found' });

    // Prevent liking own segment
    if (segment.author.toString() === req.user.id) {
      return res.status(403).json({ msg: 'You cannot upvote your own segment' });
    }

    const alreadyLiked = segment.upvotes.some(id => id.toString() === req.user.id);

    if (alreadyLiked) {
      // Unlike
      segment.upvotes = segment.upvotes.filter(id => id.toString() !== req.user.id);
    } else {
      // Like
      segment.upvotes.unshift(req.user.id);

      // Create notification for segment like
      if (segment.author.toString() !== req.user.id) {
        const User = require('../models/User');
        const liker = await User.findById(req.user.id);

        await Notification.create({
          recipient: segment.author,
          sender: req.user.id,
          type: 'like',
          story: story._id,
          message: `${liker.username} liked your contribution to "${story.title}"`,
          link: `/`
        });
      }
    }

    await story.save();
    res.json(segment.upvotes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
