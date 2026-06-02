const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PlatformSetting = sequelize.define('PlatformSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  commissionPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 5,
  },
  updatedBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = PlatformSetting;