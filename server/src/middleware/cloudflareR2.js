const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const uploadR2 = multer({
  storage: multerS3({
    s3: r2,
    bucket: process.env.R2_BUCKET_NAME || 'uibrage',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const userId = req.user ? req.user.id : 'anonymous';
      const folder = file.fieldname === 'assetFile' ? 'assets/' : 'images/';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = file.originalname.split('.').pop();
      cb(null, `uibrage/${userId}/${folder}${file.fieldname}-${uniqueSuffix}.${ext}`);
    }
  })
});

module.exports = { r2, uploadR2 };
