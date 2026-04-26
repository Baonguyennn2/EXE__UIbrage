const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  assetId: {
    type: String, // MySQL Asset UUID
    required: true,
    index: true,
  },
  userId: {
    type: String, // Cognito UUID
    required: true,
  },
  userName: {
    type: String,
  },
  userAvatar: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  replies: [{
    userId: String,
    userName: String,
    userAvatar: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Comment', CommentSchema);
