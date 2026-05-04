const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../middleware/cloudinary');

router.get('/conversations', authMiddleware, messageController.getConversations);
router.get('/:conversationId', authMiddleware, messageController.getMessages);
router.post('/send', authMiddleware, messageController.sendMessage);
router.post('/upload-image', authMiddleware, upload.single('image'), messageController.uploadImage);

module.exports = router;
