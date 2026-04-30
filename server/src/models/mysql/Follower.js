const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Follower = sequelize.define('Follower', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  followerId: {
    type: DataTypes.STRING, // User who follows
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  followingId: {
    type: DataTypes.STRING, // User being followed
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
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

module.exports = Follower;
