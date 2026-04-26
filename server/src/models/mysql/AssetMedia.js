const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AssetMedia = sequelize.define('AssetMedia', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('image', 'video'),
    defaultValue: 'image',
  },
}, {
  timestamps: true,
});

module.exports = AssetMedia;
