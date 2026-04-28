const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/create-link', authenticate, paymentController.createPaymentLink);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
