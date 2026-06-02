const { Asset, User, Order, AssetMedia, WithdrawalRequest, RevenueLedger } = require('../models/mysql');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Notification = require('../models/mongodb/Notification');
const { getCommissionPercent, setCommissionPercent, getCreatorFinancials, roundMoney } = require('../utils/finance');

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
    const platformRevenue = await RevenueLedger.sum('platformAmount', { where: { type: 'sale_credit' } }) || 0;
    const commissionPercent = await getCommissionPercent();
    const pendingWithdrawalsCount = await WithdrawalRequest.count({ where: { status: 'pending' } });
    const pendingWithdrawalsAmount = await WithdrawalRequest.sum('amount', { where: { status: 'pending' } }) || 0;

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
      platformRevenue,
      commissionPercent,
      pendingWithdrawalsCount,
      pendingWithdrawalsAmount,
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
        revenue,
        availableBalance: (await getCreatorFinancials(creator.id)).availableBalance,
        currentBalance: (await getCreatorFinancials(creator.id)).currentBalance,
      };
    }));

    const filteredResult = result.filter(c => c !== null);
    res.json(filteredResult);
  } catch (error) {
    console.error('getCreators Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getWithdrawalRequests = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const where = status === 'all' ? {} : { status };

    const requests = await WithdrawalRequest.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'fullName', 'avatarUrl', 'email'] }],
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reviewWithdrawalRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote = '' } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const request = await WithdrawalRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Withdrawal request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal request already reviewed' });
    }

    const financials = await getCreatorFinancials(request.userId);
    if (status === 'approved' && financials.currentBalance < Number(request.amount)) {
      return res.status(400).json({ message: 'Creator balance is no longer sufficient for this withdrawal' });
    }

    await sequelize.transaction(async (transaction) => {
      request.status = status;
      request.reviewedBy = req.user.id;
      request.adminNote = reviewNote;
      request.reviewedAt = new Date();
      await request.save({ transaction });

      await RevenueLedger.create({
        userId: request.userId,
        withdrawalRequestId: request.id,
        type: status === 'approved' ? 'withdrawal_approved' : 'withdrawal_rejected',
        grossAmount: 0,
        creatorAmount: Number(request.amount),
        platformAmount: 0,
        balanceDelta: status === 'approved' ? -Number(request.amount) : 0,
        note: reviewNote || (status === 'approved' ? 'Withdrawal approved' : 'Withdrawal rejected'),
        createdBy: req.user.id,
      }, { transaction });
    });

    await Notification.create({
      userId: request.userId,
      type: status === 'approved' ? 'withdrawal_approved' : 'withdrawal_rejected',
      title: status === 'approved' ? 'Withdrawal approved' : 'Withdrawal rejected',
      message: status === 'approved'
        ? `Your withdrawal of $${Number(request.amount).toFixed(2)} has been approved.`
        : `Your withdrawal of $${Number(request.amount).toFixed(2)} was rejected. ${reviewNote ? `Note: ${reviewNote}` : ''}`,
      relatedId: request.id,
    });

    res.json({ message: `Withdrawal request ${status}`, request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCommissionSetting = async (req, res) => {
  try {
    const commissionPercent = await getCommissionPercent();
    res.json({ commissionPercent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCommissionSetting = async (req, res) => {
  try {
    const { commissionPercent } = req.body;
    const numericPercent = Number(commissionPercent);

    if (!Number.isFinite(numericPercent) || numericPercent < 0) {
      return res.status(400).json({ message: 'Commission percent must be a valid number greater than or equal to 0' });
    }

    const setting = await setCommissionPercent(numericPercent, req.user.id);

    await Notification.create({
      userId: req.user.id,
      type: 'commission_updated',
      title: 'Commission updated',
      message: `Platform commission was updated to ${Number(setting.commissionPercent).toFixed(2)}%.`,
      relatedId: setting.id,
    });

    res.json({ commissionPercent: Number(setting.commissionPercent) });
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
  deleteAsset,
  getWithdrawalRequests,
  reviewWithdrawalRequest,
  getCommissionSetting,
  updateCommissionSetting,
};
