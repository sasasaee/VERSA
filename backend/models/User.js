const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  rank: {
    type: String,
    enum: ['beginner', 'master'],
    default: 'beginner'
  },
  bio: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  savedStories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  }],
  savedSegments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);