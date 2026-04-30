const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  licenseType: {
    type: DataTypes.STRING,
    defaultValue: 'Standard Commercial',
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'published', 'rejected'),
    defaultValue: 'pending',
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  downloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  coverImageUrl: {
    type: DataTypes.STRING,
  },
  fileUrl: {
    type: DataTypes.STRING,
  },
  engine: {
    type: DataTypes.STRING, // Unity, Unreal, Godot, etc.
  },
  category: {
    type: DataTypes.STRING, // RPG, Sci-Fi, Fantasy, etc.
  }
}, {
  timestamps: true,
});

module.exports = Asset;
