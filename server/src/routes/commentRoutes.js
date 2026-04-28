const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../middleware/cloudinary');

router.get('/:assetId', commentController.getCommentsByAsset);
router.post('/', authMiddleware, upload.single('image'), commentController.addComment);

module.exports = router;
