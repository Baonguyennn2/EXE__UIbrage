const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/cloudinary');

router.put('/profile', authenticate, upload.single('avatar'), userController.updateProfile);

module.exports = router;
