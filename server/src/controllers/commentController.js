const Comment = require('../models/mongodb/Comment');

const getCommentsByAsset = async (req, res) => {
  try {
    const comments = await Comment.find({ assetId: req.params.assetId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { assetId, content, rating } = req.body;
    const { id: userId, username: userName } = req.user;

    const newComment = new Comment({
      assetId,
      userId,
      userName,
      content,
      rating,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommentsByAsset,
  addComment,
};
