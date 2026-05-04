const { Asset, User, Order, AssetMedia } = require('../models/mysql');
const { Op } = require('sequelize');
const Notification = require('../models/mongodb/Notification');

const getAdminStats = async (req, res) => {
  try {
    const totalAssets = await Asset.count();
    const totalCreators = await User.count({ where: { role: { [Op.ne]: 'admin' } } });
    const pendingAssetsCount = await Asset.count({ where: { status: 'pending' } });
    
    // Total Downloads
    const totalDownloads = await Asset.sum('downloads') || 0;

    // Total Sales
    const totalSales = await Order.count({ where: { status: 'completed' } });

    // Revenue
    const revenue = await Order.sum('amount', { where: { status: 'completed' } }) || 0;

    // Last 5 orders
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, attributes: ['username', 'fullName'] }, 
        { model: Asset, attributes: ['title', 'coverImageUrl'] }
      ]
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
    // Find all non-admin users who have uploaded at least one asset
    const creatorsWithStats = await User.findAll({
      where: { role: { [Op.ne]: 'admin' } },
      attributes: { exclude: ['passwordHash'] },
      include: [
        { 
          model: Asset, 
          as: 'Assets', 
          attributes: ['id', 'price', 'downloads'] 
        }
      ]
    });

    const result = await Promise.all(creatorsWithStats.map(async (creator) => {
      const assets = creator.Assets || [];
      const assetCount = assets.length;
      
      // Only include users who actually have assets
      if (assetCount === 0) return null;
      
      // Get total sales from orders
      const assetIds = assets.map(a => a.id);
      const totalSales = await Order.count({
        where: { 
          status: 'completed',
          assetId: { [Op.in]: assetIds }
        }
      });
      const revenue = await Order.sum('amount', {
        where: { 
          status: 'completed',
          assetId: { [Op.in]: assetIds }
        }
      }) || 0;

      return {
        ...creator.toJSON(),
        Assets: undefined,
        assetCount,
        totalSales,
        revenue
      };
    }));

    const filteredResult = result.filter(c => c !== null);
    res.json(filteredResult);
  } catch (error) {
    console.error('getCreators Error:', error);
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
