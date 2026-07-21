const Comment = require('../models/mongodb/Comment');
const { User } = require('../models/mysql');

const getCommentsByAsset = async (req, res) => {
  try {
    const comments = await Comment.find({ assetId: req.params.assetId }).sort({ createdAt: -1 });
    
    // Enrich comments with user data
    const enrichedComments = await Promise.all(comments.map(async (comment) => {
      const commentObj = comment.toObject();
      
      // Try to get user info from database if not embedded
      if (!commentObj.userName || commentObj.userName === 'USER_NULL') {
        const user = await User.findByPk(comment.userId, {
          attributes: ['id', 'username', 'fullName', 'avatarUrl']
        });
        if (user) {
          commentObj.userName = user.fullName || user.username;
          commentObj.userAvatar = user.avatarUrl;
        }
      }
      
      return commentObj;
    }));
    
    res.json(enrichedComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { assetId, content, rating } = req.body;
    const { id: userId } = req.user;

    // Lookup user from database to get username and avatar
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'fullName', 'avatarUrl']
    });

    const newComment = new Comment({
      assetId,
      userId,
      userName: user?.fullName || user?.username || 'USER_NULL',
      userAvatar: user?.avatarUrl || null,
      content,
      rating,
      imageUrl: req.file ? req.file.path : null,
    });

    await newComment.save();
    res.status(201).json(newComment.toObject());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommentsByAsset,
  addComment,
};
