const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, uploadProfilePicture, getUserById } = require('../controllers/userController');
const auth = require('../middleware/auth'); // You'll need an auth middleware
const upload = require('../middleware/upload');

// Get profile
router.get('/profile', auth, getUserProfile);

// Update profile
router.put('/profile', auth, updateUserProfile);

// Upload profile picture
router.post('/profile/picture', auth, upload.single('profilePicture'), uploadProfilePicture);

// Get user by ID
router.get('/:id', auth, getUserById);

module.exports = router;
