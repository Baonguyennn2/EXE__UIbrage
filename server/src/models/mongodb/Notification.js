const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // MySQL User ID
  type: { 
    type: String, 
    enum: ['asset_approved', 'asset_rejected', 'new_order', 'new_message'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: String }, // e.g. Asset ID or Message ID
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
