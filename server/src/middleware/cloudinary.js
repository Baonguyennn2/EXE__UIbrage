const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on file type
    let folder = 'uibrage/others';
    if (file.fieldname === 'coverImage') folder = 'uibrage/covers';
    if (file.fieldname === 'screenshots') folder = 'uibrage/screenshots';
    if (file.fieldname === 'assetFile') folder = 'uibrage/binaries';

    return {
      folder: folder,
      resource_type: 'auto', // Important for non-image files like ZIP
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
