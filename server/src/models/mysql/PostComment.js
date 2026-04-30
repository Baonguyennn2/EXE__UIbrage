const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PostComment = sequelize.define('PostComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = PostComment;
