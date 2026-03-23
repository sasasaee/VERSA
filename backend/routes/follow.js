const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/follow/:id
// @desc    Follow or unfollow a user
// @access  Private
router.post('/:id', auth, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ msg: 'You cannot follow yourself' });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isFollowing = targetUser.followers.some(
            id => id.toString() === currentUserId.toString()
        );

        if (isFollowing) {
            // Unfollow
            targetUser.followers = targetUser.followers.filter(
                id => id.toString() !== currentUserId
            );
            currentUser.following = currentUser.following.filter(
                id => id.toString() !== targetUserId
            );
        } else {
            // Follow
            targetUser.followers.push(currentUserId);
            currentUser.following.push(targetUserId);

            // Create notification for follow
            const Notification = require('../models/Notification');
            const newNotification = new Notification({
                recipient: targetUserId,
                sender: currentUserId,
                type: 'follow',
                message: `${currentUser.username} started following you.`,
                link: `/profile/${currentUserId}`
            });
            await newNotification.save();
        }

        await targetUser.save();
        await currentUser.save();

        res.json({
            isFollowing: !isFollowing,
            followersCount: targetUser.followers.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/follow/followers/:id
// @desc    Get followers list
// @access  Private/Public (token sent, but works mostly for getting list)
router.get('/followers/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', 'username profilePicture rank');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user.followers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/follow/following/:id
// @desc    Get following list
// @access  Private/Public
router.get('/following/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('following', 'username profilePicture rank');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user.following);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
