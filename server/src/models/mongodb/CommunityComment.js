const mongoose = require('mongoose');

const CommunityCommentSchema = new mongoose.Schema({
  postId: {
    type: String, // MySQL Post UUID
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  replies: [{
    userId: String,
    userName: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('CommunityComment', CommunityCommentSchema);
