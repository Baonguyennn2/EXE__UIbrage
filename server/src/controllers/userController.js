const { User, Asset } = require('../models/mysql');

const updateProfile = async (req, res) => {
  // ... (keep existing code)
  try {
    const { id } = req.user;
    const updateData = {};
    const fields = ['fullName', 'bio', 'jobTitle', 'location', 'website', 'facebookUrl', 'twitterUrl', 'githubUrl'];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.file) {
      updateData.avatarUrl = req.file.path; // Cloudinary URL from multer-storage-cloudinary
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

module.exports = {
  updateProfile,
  getWishlist,
  toggleWishlist,
  getEarnings
};
