const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
  },
  icon: {
    type: DataTypes.STRING, // Remix Icon name or URL
  },
  type: {
    type: DataTypes.STRING, // 'ui-style', 'genre', etc.
    defaultValue: 'ui-style'
  }
}, {
  timestamps: true,
});

module.exports = Category;
