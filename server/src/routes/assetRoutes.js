const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/cloudinary');

router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);

router.post('/', authenticate, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'assetFile', maxCount: 1 },
  { name: 'screenshots', maxCount: 10 }
]), assetController.createAsset);

module.exports = router;
