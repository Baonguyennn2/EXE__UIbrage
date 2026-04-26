const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:assetId', commentController.getCommentsByAsset);
router.post('/', authMiddleware, commentController.addComment);

module.exports = router;
