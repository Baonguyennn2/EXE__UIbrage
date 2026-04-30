const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../utils/upload');

// Admin only check
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

router.use(authMiddleware);

router.get('/stats', isAdmin, adminController.getAdminStats);
router.get('/creators', isAdmin, adminController.getCreators);
router.get('/pending-assets', isAdmin, adminController.getPendingAssets);
router.patch('/approve/:id', isAdmin, adminController.approveAsset);
router.delete('/assets/:id', isAdmin, adminController.deleteAsset);

module.exports = router;
