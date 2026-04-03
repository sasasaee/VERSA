const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, default: 'General' },
  headerImage: { type: String },

  isPaused: { type: Boolean, default: false },
  authorRank: { type: String, enum: ['reader', 'beginner', 'author'], default: 'beginner' },

  segments: [
    {
      content: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
      editedAt: { type: Date, default: null },         // NEW: track last edit time
      upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]  // NEW: per-segment upvotes
    }
  ],

  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
