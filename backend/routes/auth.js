const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Creates the new user
    user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    //Create a Token
    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, message: 'Registration successful' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    //Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    //Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    //Generate Token
    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, message: 'Logged in successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/google', async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update googleId and profilePicture if not set
      if (!user.googleId) user.googleId = sub;
      if (!user.profilePicture) user.profilePicture = picture;
      user.isGoogleAccount = true;
      await user.save();
    } else {
      // Create new user
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      user = new User({
        username,
        email,
        googleId: sub,
        isGoogleAccount: true,
        profilePicture: picture || ''
      });
      await user.save();
    }

    // Generate Versa Token
    const jwtPayload = { userId: user.id };
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, message: 'Google login successful' });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ message: 'Invalid Google token' });
  }
});

module.exports = router;