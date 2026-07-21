const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

// Define Follower table first
const Follower = sequelize.define('Follower', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  followerId: {
    type: DataTypes.STRING, // User who follows
    allowNull: false,
  },
  followingId: {
    type: DataTypes.STRING, // User being followed
    allowNull: false,
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['followerId', 'followingId']
    }
  ]
});

// Associations defined in index.js
module.exports = Follower;
