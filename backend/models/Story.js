const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, default: 'General' },
  headerImage: { type: String },

  isPaused: { type: Boolean, default: false },
  authorRank: { type: String, enum: ['beginner', 'master'], default: 'beginner' },

  segments: [
    {
      content: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  ],

  // Who started the story? + adds timestamp
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);