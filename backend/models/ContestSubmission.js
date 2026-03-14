const mongoose = require('mongoose');

const contestSubmissionSchema = new mongoose.Schema({
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensures one submission per user per contest
contestSubmissionSchema.index({ contest: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ContestSubmission', contestSubmissionSchema);
