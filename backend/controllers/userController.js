const User = require('../models/User');
const Story = require('../models/Story');

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateUserProfile = async (req, res) => {
    const { bio, username } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (bio) user.bio = bio;
        if (username) user.username = username;

        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            rank: user.rank,
            bio: user.bio,
            profilePicture: user.profilePicture
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.profilePicture = req.file.path;
        await user.save();

        res.json({
            message: 'Profile picture uploaded successfully',
            profilePicture: user.profilePicture
        });

    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
};

exports.getSavedItems = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'savedStories',
                populate: { path: 'author', select: 'username rank profilePicture' }
            });

        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Fetch stories that contain any of the user's saved segments
        const storiesWithSavedSegments = await Story.find({
            'segments._id': { $in: user.savedSegments }
        }).populate('author', 'username rank profilePicture');

        const savedSegments = [];
        storiesWithSavedSegments.forEach(story => {
            story.segments.forEach(segment => {
                if (user.savedSegments.some(id => id.toString() === segment._id.toString())) {
                    savedSegments.push({
                        _id: segment._id,
                        content: segment.content,
                        storyId: story._id,
                        storyTitle: story.title,
                        updatedAt: segment.createdAt
                    });
                }
            });
        });

        console.log(`DEBUG [SavedItems]: User ID: ${req.user.id}`);
        console.log(`DEBUG [SavedItems]: Raw savedStories count: ${user.savedStories.length}`);

        console.log(`DEBUG [SavedItems]: Found ${user.savedStories.length} stories and ${savedSegments.length} segments`);

        // Final check on savedStories content
        user.savedStories.forEach((s, i) => {
            console.log(`DEBUG [SavedItems]: Story ${i}: ${s ? s.title : 'NULL'}`);
        });

        res.json({
            savedStories: user.savedStories.filter(s => s !== null),
            savedSegments: savedSegments
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
