const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.confirmSignUp);
router.post('/resend-code', authController.resendConfirmationCode);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.confirmForgotPassword);
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

module.exports = router;
