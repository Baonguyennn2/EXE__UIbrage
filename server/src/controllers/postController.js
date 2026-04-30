const { Post, User } = require('../models/mysql');
const { Op } = require('sequelize');
const { cloudinary } = require('../middleware/cloudinary');
const CommunityComment = require('../models/mongodb/CommunityComment');
const CommunityPostAnalytics = require('../models/mongodb/CommunityPostAnalytics');

const getAllPosts = async (req, res) => {
  try {
    const { search, tag } = req.query;
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (tag) {
      where.tags = { [Op.like]: `%${tag}%` };
    }

    const posts = await Post.findAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['username', 'fullName', 'avatarUrl'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Enhance posts with data from MongoDB
    const postIds = posts.map(p => p.id);
    
    const [analytics, commentCounts] = await Promise.all([
      CommunityPostAnalytics.find({ postId: { $in: postIds } }),
      CommunityComment.aggregate([
        { $match: { postId: { $in: postIds } } },
        { $group: { _id: "$postId", count: { $sum: 1 } } }
      ])
    ]);

    const analyticsMap = Object.fromEntries(analytics.map(a => [a.postId, a.viewCount]));
    const commentCountMap = Object.fromEntries(commentCounts.map(c => [c._id, c.count]));

    const enhancedPosts = posts.map(p => {
      const plainPost = p.get({ plain: true });
      return {
        ...plainPost,
        viewCount: analyticsMap[p.id] || 0,
        commentCount: commentCountMap[p.id] || 0
      };
    });

    res.json(enhancedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['username', 'fullName', 'avatarUrl'] }
      ]
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Fetch comments and analytics from MongoDB
    const [comments, analytics] = await Promise.all([
      CommunityComment.find({ postId: req.params.id }).sort({ createdAt: -1 }),
      CommunityPostAnalytics.findOneAndUpdate(
        { postId: req.params.id },
        { $inc: { viewCount: 1 } },
        { upsert: true, new: true }
      )
    ]);

    const plainPost = post.get({ plain: true });
    res.json({
      ...plainPost,
      comments,
      viewCount: analytics.viewCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const file = req.file;
    let coverImageUrl = null;

    if (file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'uibrage/community' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(file.buffer);
      });
      coverImageUrl = result.secure_url;
    }

    const post = await Post.create({
      title,
      content,
      tags,
      coverImageUrl,
      authorId: req.user.id
    });

    // Initialize analytics in MongoDB
    await CommunityPostAnalytics.create({ postId: post.id, viewCount: 0 });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadPostImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'uibrage/community/inline' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(req.file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    const comment = await CommunityComment.create({
      content,
      postId,
      userId: req.user.id,
      userName: req.user.username
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  uploadPostImage,
  addComment
};
