const mongoose = require('mongoose');

const CommunityPostAnalyticsSchema = new mongoose.Schema({
  postId: {
    type: String, // MySQL Post UUID
    required: true,
    unique: true,
    index: true,
  },
  viewCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('CommunityPostAnalytics', CommunityPostAnalyticsSchema);
