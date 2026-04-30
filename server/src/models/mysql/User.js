const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING, // Cognito Sub (UUID)
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  fullName: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.ENUM('customer', 'creator', 'admin'),
    defaultValue: 'customer',
  },
  avatarUrl: {
    type: DataTypes.STRING,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  jobTitle: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  website: {
    type: DataTypes.STRING,
  },
  facebookUrl: {
    type: DataTypes.STRING,
  },
  twitterUrl: {
    type: DataTypes.STRING,
  },
  githubUrl: {
    type: DataTypes.STRING,
  },
  coverImageUrl: {
    type: DataTypes.STRING,
  },
  coverPosition: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  profileFrame: {
    type: DataTypes.STRING, // 'none', 'sakura', 'pixel', 'modern_vn'
    defaultValue: 'none',
  },
}, {
  timestamps: true,
});

module.exports = User;
