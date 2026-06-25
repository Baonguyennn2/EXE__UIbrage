const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/cloudinary');

router.put('/profile', authenticate, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), userController.updateProfile);
router.get('/profile/:username', userController.getUserProfile);
router.get('/wishlist', authenticate, userController.getWishlist);
router.post('/wishlist/toggle', authenticate, userController.toggleWishlist);
router.get('/earnings', authenticate, userController.getEarnings);
router.get('/withdrawals', authenticate, userController.getWithdrawalRequests);
router.post('/withdrawals', authenticate, userController.requestWithdrawal);
router.get('/transactions', authenticate, userController.getTransactions);
router.get('/purchases', authenticate, userController.getPurchases);
router.get('/orders', authenticate, userController.getOrderHistory);
router.get('/admin-contact', authenticate, userController.getAdminContact);
router.post('/online-status', authenticate, userController.getOnlineStatus);

module.exports = router;
