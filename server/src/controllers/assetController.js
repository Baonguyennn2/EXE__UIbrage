const { Asset, User, AssetMedia } = require('../models/mysql');
const { Op } = require('sequelize');

const getAllAssets = async (req, res) => {
  try {
    const { category, engine, minPrice, maxPrice, search } = req.query;
    const where = { status: 'published' };

    if (category) where.category = category;
    if (engine) where.engine = engine;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const assets = await Asset.findAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['username', 'fullName', 'avatarUrl'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'avatarUrl'] },
        { model: AssetMedia, as: 'media' },
      ],
    });

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAsset = async (req, res) => {
  try {
    const { title, description, price, category, engine, licenseType, isFree, tags } = req.body;
    const files = req.files;

    if (!files || !files.coverImage || !files.assetFile) {
      return res.status(400).json({ error: 'Missing required files (Cover Image and Asset ZIP)' });
    }

    const newAsset = await Asset.create({
      title,
      description,
      price: isFree === 'true' ? 0 : parseFloat(price),
      category,
      engine,
      licenseType,
      isFree: isFree === 'true',
      tags,
      coverImageUrl: files.coverImage[0].path,
      fileUrl: files.assetFile[0].path,
      authorId: req.user.id, // Set by auth middleware
      status: 'pending' // Default status for review
    });

    // Handle screenshots
    if (files.screenshots) {
      const mediaEntries = files.screenshots.map(file => ({
        assetId: newAsset.id,
        url: file.path,
        type: 'image'
      }));
      await AssetMedia.bulkCreate(mediaEntries);
    }

    res.status(201).json(newAsset);
  } catch (error) {
    console.error('Create Asset Error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset
};
