const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uibrage/assets',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'zip', 'rar'],
    resource_type: 'auto',
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
