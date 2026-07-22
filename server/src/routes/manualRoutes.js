const express = require('express');
const router = express.Router();
const manualController = require('../controllers/manualController');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadR2 } = require('../middleware/cloudflareR2');

// Only allow admin role (inline middleware)
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admins only' });
  }
};

router.get('/', manualController.getAllManuals);

// Admin routes
router.post('/', authMiddleware, requireAdmin, uploadR2.single('file'), manualController.createManual);
router.put('/:id', authMiddleware, requireAdmin, uploadR2.single('file'), manualController.updateManual);
router.delete('/:id', authMiddleware, requireAdmin, manualController.deleteManual);

module.exports = router;
