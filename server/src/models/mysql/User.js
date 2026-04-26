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
}, {
  timestamps: true,
});

module.exports = User;
