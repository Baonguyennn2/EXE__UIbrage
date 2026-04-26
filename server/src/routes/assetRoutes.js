const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);

module.exports = router;
