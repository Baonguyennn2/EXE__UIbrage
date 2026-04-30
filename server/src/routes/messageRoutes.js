const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/conversations', authMiddleware, messageController.getConversations);
router.get('/:conversationId', authMiddleware, messageController.getMessages);
router.post('/send', authMiddleware, messageController.sendMessage);

module.exports = router;
