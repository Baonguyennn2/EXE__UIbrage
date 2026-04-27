const { Asset, User, AssetMedia, Category, Tag } = require('../models/mysql');
const { Op } = require('sequelize');

const getAllAssets = async (req, res) => {
  try {
    const { categoryId, engine, minPrice, maxPrice, search, tagId } = req.query;
    const where = { status: 'published' };

    if (engine) where.engine = engine;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const include = [
      { model: User, as: 'author', attributes: ['username', 'fullName', 'avatarUrl'] },
      { model: Category, as: 'categoryData' },
      { 
        model: Tag, 
        as: 'tags',
        // If categoryId or tagId is provided, filter by it
        ...( (categoryId || tagId) ? { where: { id: categoryId || tagId } } : {})
      },
    ];

    const assets = await Asset.findAll({
      where,
      include,
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
        { model: Category, as: 'categoryData' },
        { model: Tag, as: 'tags' },
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
    const { title, description, price, categoryId, engine, licenseType, isFree, tagIds } = req.body;
    const files = req.files;

    if (!files || !files.coverImage || !files.assetFile) {
      return res.status(400).json({ error: 'Missing required files (Cover Image and Asset ZIP)' });
    }

    const newAsset = await Asset.create({
      title,
      description,
      price: isFree === 'true' ? 0 : parseFloat(price),
      categoryId: parseInt(categoryId),
      engine,
      licenseType,
      isFree: isFree === 'true',
      coverImageUrl: files.coverImage[0].path,
      fileUrl: files.assetFile[0].path,
      authorId: req.user.id,
      status: 'pending'
    });

    // Handle tags (many-to-many)
    if (tagIds) {
      // tagIds might be a string if coming from FormData with one value, or an array
      const tagsArray = Array.isArray(tagIds) ? tagIds : [tagIds];
      await newAsset.setTags(tagsArray);
    }

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
