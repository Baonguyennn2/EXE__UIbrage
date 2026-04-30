const { User, Asset } = require('../models/mysql');

const updateProfile = async (req, res) => {
  // ... (keep existing code)
  try {
    const { id } = req.user;
    const updateData = {};
    const fields = ['fullName', 'bio', 'jobTitle', 'location', 'website', 'facebookUrl', 'twitterUrl', 'githubUrl', 'profileFrame', 'coverPosition', 'coverZoom'];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.files) {
      if (req.files.avatar) updateData.avatarUrl = req.files.avatar[0].path;
      if (req.files.coverImage) updateData.coverImageUrl = req.files.coverImage[0].path;
    }

    await User.update(updateData, { where: { id } });
    const updatedUser = await User.findByPk(id, { attributes: { exclude: ['passwordHash'] } });
    res.json(updatedUser);
  } catch (error) {
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

const { Order } = require('../models/mysql');

const getEarnings = async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: { authorId: req.user.id },
      include: [{
        model: Order,
        where: { status: 'completed' },
        required: false
      }]
    });

    let totalEarnings = 0;
    const salesBreakdown = assets.map(asset => {
      const assetSales = asset.Orders || [];
      const assetRevenue = assetSales.reduce((sum, order) => sum + parseFloat(order.amount), 0);
      totalEarnings += assetRevenue;
      return {
        id: asset.id,
        title: asset.title,
        salesCount: assetSales.length,
        revenue: assetRevenue
      };
    });

    res.json({
      totalEarnings,
      salesBreakdown
    });
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
    
    const followerCount = await user.countFollowers();
    const followingCount = await user.countFollowing();
    
    const profileData = user.toJSON();
    profileData.followerCount = followerCount;
    profileData.followingCount = followingCount;
    
    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateProfile,
  getWishlist,
  toggleWishlist,
  getEarnings,
  getUserProfile
};
