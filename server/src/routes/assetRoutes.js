const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);

router.post('/', authenticate, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'assetFile', maxCount: 1 },
  { name: 'screenshots', maxCount: 10 }
]), assetController.createAsset);

module.exports = router;
