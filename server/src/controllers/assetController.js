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

module.exports = {
  getAllAssets,
  getAssetById,
};
