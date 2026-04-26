const { Asset, User, Order, AssetMedia } = require('../models/mysql');
const { Op } = require('sequelize');

const getAdminStats = async (req, res) => {
  try {
    const totalAssets = await Asset.count();
    const totalCreators = await User.count({ where: { role: 'creator' } });
    const pendingAssets = await Asset.count({ where: { status: 'pending' } });
    
    // Revenue (completed orders)
    const revenue = await Order.sum('amount', { where: { status: 'completed' } }) || 0;

    res.json({
      totalAssets,
      totalCreators,
      pendingAssets,
      revenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingAssets = async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'author', attributes: ['username', 'fullName'] }]
    });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'published' or 'rejected'

    const asset = await Asset.findByPk(id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    asset.status = status;
    await asset.save();

    res.json({ message: `Asset ${status} successfully`, asset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAsset = async (req, res) => {
  try {
    const { title, description, price, engine, category, licenseType, isFree } = req.body;
    const authorId = req.user.id;
    
    // Assuming cover image is uploaded to req.files.coverImage[0]
    // And file is uploaded to req.files.assetFile[0]
    const coverImageUrl = req.files?.coverImage ? req.files.coverImage[0].path : null;
    const fileUrl = req.files?.assetFile ? req.files.assetFile[0].path : null;

    const asset = await Asset.create({
      title,
      description,
      price,
      engine,
      category,
      licenseType,
      isFree: isFree === 'true',
      coverImageUrl,
      fileUrl,
      authorId,
      status: 'pending'
    });

    // Handle screenshots
    if (req.files?.screenshots) {
      const mediaData = req.files.screenshots.map(file => ({
        url: file.path,
        assetId: asset.id,
        type: 'image'
      }));
      await AssetMedia.bulkCreate(mediaData);
    }

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getPendingAssets,
  approveAsset,
  createAsset
};
