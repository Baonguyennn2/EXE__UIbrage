const { User, Asset, RevenueLedger, WithdrawalRequest, Order, Follower } = require('../models/mysql');
const Notification = require('../models/mongodb/Notification');
const sequelize = require('../config/database');
const { getCreatorFinancials, roundMoney } = require('../utils/finance');

const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const updateData = {};
    const allowedFields = ['username', 'fullName', 'bio', 'jobTitle', 'location', 'website', 'facebookUrl', 'twitterUrl', 'githubUrl', 'profileFrame', 'coverPosition', 'coverZoom'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.files) {
      if (req.files.avatar) updateData.avatarUrl = req.files.avatar[0].path;
      if (req.files.coverImage) updateData.coverImageUrl = req.files.coverImage[0].path;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Check if username is being changed and if it's already taken
    if (updateData.username) {
      const existing = await User.findOne({ 
        where: { username: updateData.username, id: { [require('sequelize').Op.ne]: id } }
      });
      if (existing) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    await User.update(updateData, { where: { id } });
    const updatedUser = await User.findByPk(id, { attributes: { exclude: ['passwordHash'] } });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ 
        model: Asset, 
        as: 'wishlist',
        include: [{ model: User, as: 'author', attributes: ['username', 'avatarUrl'] }] 
      }]
    });
    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { assetId } = req.body;
    const user = await User.findByPk(req.user.id);
    const asset = await Asset.findByPk(assetId);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    
    const hasAsset = await user.hasWishlist(asset);
    if (hasAsset) {
      await user.removeWishlist(asset);
      res.json({ message: 'Removed from wishlist', isWishlisted: false });
    } else {
      await user.addWishlist(asset);
      res.json({ message: 'Added to wishlist', isWishlisted: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const financials = await getCreatorFinancials(userId);

    const completedSales = await RevenueLedger.findAll({
      where: { userId, type: 'sale_credit' },
      include: [{ model: Asset, as: 'asset' }],
      order: [['createdAt', 'DESC']],
    });

    const withdrawals = await WithdrawalRequest.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    const assetMap = new Map();
    completedSales.forEach((entry) => {
      const assetId = entry.assetId || entry.asset?.id || 'unknown';
      const current = assetMap.get(assetId) || {
        id: assetId,
        title: entry.asset?.title || 'Unknown asset',
        salesCount: 0,
        grossRevenue: 0,
        creatorRevenue: 0,
        platformRevenue: 0,
      };

      current.salesCount += 1;
      current.grossRevenue += Number(entry.grossAmount || 0);
      current.creatorRevenue += Number(entry.creatorAmount || 0);
      current.platformRevenue += Number(entry.platformAmount || 0);
      assetMap.set(assetId, current);
    });

    const salesBreakdown = Array.from(assetMap.values()).map((item) => ({
      ...item,
      grossRevenue: roundMoney(item.grossRevenue),
      revenue: roundMoney(item.creatorRevenue),
      platformRevenue: roundMoney(item.platformRevenue),
    }));

    const transactions = [
      ...completedSales.map((entry) => ({
        id: entry.id,
        type: entry.type,
        amount: Number(entry.creatorAmount || 0),
        grossAmount: Number(entry.grossAmount || 0),
        platformAmount: Number(entry.platformAmount || 0),
        assetId: entry.assetId,
        title: entry.asset?.title || 'Unknown asset',
        createdAt: entry.createdAt,
      })),
      ...withdrawals.map((request) => ({
        id: request.id,
        type: `withdrawal_${request.status}`,
        amount: Number(request.amount || 0),
        status: request.status,
        note: request.adminNote || request.note,
        createdAt: request.createdAt,
        reviewedAt: request.reviewedAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      totalEarnings: financials.totalEarnings,
      grossRevenue: financials.grossRevenue,
      platformRevenue: financials.platformRevenue,
      currentBalance: financials.currentBalance,
      availableBalance: financials.availableBalance,
      pendingWithdrawalAmount: financials.pendingWithdrawalAmount,
      totalWithdrawn: financials.totalWithdrawn,
      totalSales: financials.totalSales,
      commissionPercent: await require('../utils/finance').getCommissionPercent(),
      salesBreakdown,
      withdrawals,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestWithdrawal = async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ message: 'Only creator accounts can request withdrawals' });
    }

    const userId = req.user.id;
    const { amount, payoutMethod = 'bank', payoutDetails = '', note = '' } = req.body;
    const numericAmount = roundMoney(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'Withdrawal amount must be greater than zero' });
    }

    const financials = await getCreatorFinancials(userId);
    if (numericAmount > financials.availableBalance) {
      return res.status(400).json({ message: 'Insufficient withdrawable balance' });
    }

    const withdrawal = await sequelize.transaction(async (transaction) => {
      const createdRequest = await WithdrawalRequest.create({
        userId,
        amount: numericAmount,
        payoutMethod,
        payoutDetails,
        note,
        status: 'pending',
      }, { transaction });

      await RevenueLedger.create({
        userId,
        withdrawalRequestId: createdRequest.id,
        type: 'withdrawal_request',
        grossAmount: 0,
        creatorAmount: numericAmount,
        platformAmount: 0,
        balanceDelta: 0,
        note: `Withdrawal request submitted for $${numericAmount.toFixed(2)}`,
        createdBy: userId,
      }, { transaction });

      return createdRequest;
    });

    const admin = await User.findOne({ where: { role: 'admin' }, attributes: ['id', 'username', 'fullName'] });
    if (admin) {
      await Notification.create({
        userId: admin.id,
        type: 'withdrawal_requested',
        title: 'New withdrawal request',
        message: `Creator ${req.user.username || req.user.id} requested a $${numericAmount.toFixed(2)} withdrawal.`,
        relatedId: withdrawal.id,
      });
    }

    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWithdrawalRequests = async (req, res) => {
  try {
    const requests = await WithdrawalRequest.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const entries = await RevenueLedger.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'title', 'coverImageUrl'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkIsFollowing = async (req, res) => {
  try {
    const { id: currentUserId } = req.user;
    const { userId: targetUserId } = req.params;

    const currentUser = await User.findByPk(currentUserId);
    const targetUser = await User.findByPk(targetUserId);

    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Check using Sequelize association - Users follow other Users through Follower table
    const following = await Follower.findOne({
      where: {
        followerId: currentUserId,
        followingId: targetUserId
      }
    });
    
    res.json({ isFollowing: !!following });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFollow = async (req, res) => {
  try {
    const { id: currentUserId } = req.user;
    const { userId: targetUserId } = req.params;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const currentUser = await User.findByPk(currentUserId);
    const targetUser = await User.findByPk(targetUserId);

    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Check if already following
    const existingFollow = await Follower.findOne({
      where: {
        followerId: currentUserId,
        followingId: targetUserId
      }
    });

    if (existingFollow) {
      await existingFollow.destroy();
      res.json({ message: 'Unfollowed successfully', isFollowing: false });
    } else {
      await Follower.create({
        followerId: currentUserId,
        followingId: targetUserId
      });
      res.json({ message: 'Followed successfully', isFollowing: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ 
      where: { username },
      attributes: { exclude: ['passwordHash'] }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Use Follower model directly for consistency
    const followerCount = await Follower.count({ where: { followingId: user.id } });
    const followingCount = await Follower.count({ where: { followerId: user.id } });
    const assetCount = await Asset.count({ where: { authorId: user.id } });
    
    const profileData = user.toJSON();
    profileData.followerCount = followerCount;
    profileData.followingCount = followingCount;
    profileData.assetCount = assetCount;
    
    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminContact = async (req, res) => {
  try {
    const admin = await User.findOne({
      where: { role: 'admin' },
      attributes: ['id', 'username', 'fullName', 'avatarUrl', 'email']
    });
    if (!admin) return res.status(404).json({ message: 'No admin found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOnlineStatus = async (req, res) => {
  try {
    const { userIds } = req.body;
    const onlineUsers = req.app.get('onlineUsers') || new Map();
    const status = {};
    if (Array.isArray(userIds)) {
      userIds.forEach(id => {
        status[id] = onlineUsers.has(id);
      });
    }
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPurchases = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id, status: 'completed' },
      include: [
        { 
          model: Asset,
          as: 'asset',
          include: [{ model: User, as: 'author', attributes: ['username', 'fullName', 'avatarUrl'] }]
        }
      ],
      order: [['updatedAt', 'DESC']],
    });

    const purchasedAssets = orders.map(order => order.asset).filter(a => a != null);
    res.json(purchasedAssets);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: error.message });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        { 
          model: Asset,
          as: 'asset',
          attributes: ['id', 'title', 'coverImageUrl']
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateProfile,
  getWishlist,
  toggleWishlist,
  getEarnings,
  requestWithdrawal,
  getWithdrawalRequests,
  getTransactions,
  getUserProfile,
  checkIsFollowing,
  toggleFollow,
  getAdminContact,
  getOnlineStatus,
  getPurchases,
  getOrderHistory
};
