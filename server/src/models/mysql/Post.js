const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tags: {
    type: DataTypes.STRING, 
    defaultValue: ''
  },
  coverImageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Post;
