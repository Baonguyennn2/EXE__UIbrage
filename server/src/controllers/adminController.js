const { Asset, User, Order, AssetMedia } = require('../models/mysql');
const { Op } = require('sequelize');
const Notification = require('../models/mongodb/Notification');

const getAdminStats = async (req, res) => {
  try {
    const totalAssets = await Asset.count();
    const totalCreators = await User.count({ where: { role: 'creator' } });
    const pendingAssetsCount = await Asset.count({ where: { status: 'pending' } });
    
    // Total Downloads (sum of all assets)
    const totalDownloads = await Asset.sum('downloads') || 0;

    // Total Sales (count of completed orders)
    const totalSales = await Order.count({ where: { status: 'completed' } });

    // Revenue (sum of amount for completed orders)
    const revenue = await Order.sum('amount', { where: { status: 'completed' } }) || 0;

    // Last 5 orders
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['username'] }, { model: Asset, attributes: ['title'] }]
    });

    res.json({
      totalAssets,
      totalCreators,
      pendingAssetsCount,
      revenue,
      totalDownloads,
      totalSales,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCreators = async (req, res) => {
  try {
    const creators = await User.findAll({
      where: { role: { [Op.ne]: 'admin' } }, // Show everyone except admins
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Asset, attributes: ['id'] }]
    });

    const creatorsWithStats = await Promise.all(creators.map(async (creator) => {
      const assetCount = creator.Assets ? creator.Assets.length : 0;
      const totalSales = await Order.count({
        include: [{ model: Asset, where: { authorId: creator.id } }],
        where: { status: 'completed' }
      });
      const revenue = await Order.sum('amount', {
        include: [{ model: Asset, where: { authorId: creator.id } }],
        where: { status: 'completed' }
      }) || 0;

      return {
        ...creator.toJSON(),
        assetCount,
        totalSales,
        revenue
      };
    }));

    res.json(creatorsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingAssets = async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'author', attributes: ['username', 'fullName', 'avatarUrl'] }]
    });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // 'published' or 'rejected'

    const asset = await Asset.findByPk(id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    asset.status = status;
    if (rejectionReason) asset.rejectionReason = rejectionReason;
    await asset.save();

    // Send Notification to Creator
    await Notification.create({
      userId: asset.authorId,
      type: status === 'published' ? 'asset_approved' : 'asset_rejected',
      title: status === 'published' ? 'Asset Approved!' : 'Asset Rejected',
      message: status === 'published' 
        ? `Your asset "${asset.title}" has been approved and is now live.` 
        : `Your asset "${asset.title}" was rejected. Reason: ${rejectionReason || 'No reason provided.'}`,
      relatedId: asset.id
    });

    res.json({ message: `Asset ${status} successfully`, asset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    await Asset.destroy({ where: { id } });
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getCreators,
  getPendingAssets,
  approveAsset,
  deleteAsset
};
