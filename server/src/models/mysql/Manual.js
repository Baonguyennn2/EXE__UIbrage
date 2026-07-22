const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Manual = sequelize.define('Manual', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('link', 'file'),
    allowNull: false,
    defaultValue: 'link'
  },
  content_url: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = Manual;
