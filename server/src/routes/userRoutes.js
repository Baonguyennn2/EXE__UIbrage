const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/cloudinary');

router.put('/profile', authenticate, upload.single('avatar'), userController.updateProfile);
router.get('/wishlist', authenticate, userController.getWishlist);
router.post('/wishlist/toggle', authenticate, userController.toggleWishlist);
router.get('/earnings', authenticate, userController.getEarnings);

module.exports = router;
