const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../utils/upload');

// Admin only check (could be refined)
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

router.use(authMiddleware);

router.get('/stats', isAdmin, adminController.getAdminStats);
router.get('/pending-assets', isAdmin, adminController.getPendingAssets);
router.patch('/approve/:id', isAdmin, adminController.approveAsset);

// Creators/Admins can upload
router.post('/assets', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'assetFile', maxCount: 1 },
  { name: 'screenshots', maxCount: 10 }
]), adminController.createAsset);

module.exports = router;
