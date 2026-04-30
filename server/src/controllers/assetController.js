const { Asset, User, AssetMedia, Category, Tag } = require('../models/mysql');
const { Op } = require('sequelize');
const { r2 } = require('../middleware/cloudflareR2');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { cloudinary } = require('../middleware/cloudinary');
const crypto = require('crypto');

const getAllAssets = async (req, res) => {
  try {
    const { categoryId, engine, minPrice, maxPrice, search, tagId, authorId } = req.query;
    
    // If authorId is provided, we likely want all their assets (even pending) for their library
    // Otherwise, only show published assets
    const where = authorId ? { authorId } : { status: 'published' };
    if (engine) where.engine = engine;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const include = [
      { model: User, as: 'author', attributes: ['username', 'fullName', 'avatarUrl'] },
      { model: Category, as: 'categoryData' },
      { 
        model: Tag, 
        as: 'tags',
        // If categoryId or tagId is provided, filter by it
        ...( (categoryId || tagId) ? { where: { id: categoryId || tagId } } : {})
      },
    ];

    const assets = await Asset.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
    });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'avatarUrl'] },
        { model: AssetMedia, as: 'media' },
        { model: Category, as: 'categoryData' },
        { model: Tag, as: 'tags' },
      ],
    });

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAsset = async (req, res) => {
  try {
    const { title, description, price, categoryId, engine, licenseType, isFree, tagIds } = req.body;
    const files = req.files;

    if (!files || !files.coverImage || !files.assetFile) {
      return res.status(400).json({ error: 'Missing required files (Cover Image and Asset ZIP)' });
    }

    const productId = crypto.randomUUID();
    const userId = req.user.id;

    // 1. Upload ZIP to R2
    console.log('--- STARTING R2 UPLOAD ---');
    const assetFile = files.assetFile[0];
    const r2Key = `uibrage/${userId}/${productId}/assets/${Date.now()}-${assetFile.originalname}`;
    
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'uibrag',
      Key: r2Key,
      Body: assetFile.buffer,
      ContentType: assetFile.mimetype
    }));
    console.log('--- R2 UPLOAD SUCCESS ---');

    const fileUrl = `${process.env.R2_PUBLIC_URL}/${r2Key}`;

    // 2. Upload Cover Image to Cloudinary
    console.log('--- STARTING CLOUDINARY UPLOAD ---');
    console.log('Cloud Name:', cloudinary.config().cloud_name);
    const uploadToCloudinary = (buffer, folder) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'auto' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Error Detail:', error);
              reject(error);
            }
            else resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });
    };

    const coverImageUrl = await uploadToCloudinary(files.coverImage[0].buffer, `uibrage_covers`);
    console.log('--- CLOUDINARY UPLOAD SUCCESS ---');

    // 3. Create Asset record
    const newAsset = await Asset.create({
      id: productId,
      title,
      description,
      price: isFree === 'true' ? 0 : parseFloat(price),
      categoryId: categoryId && categoryId !== 'undefined' ? parseInt(categoryId) : null,
      engine,
      licenseType,
      isFree: isFree === 'true',
      coverImageUrl,
      fileUrl,
      authorId: userId,
      status: 'published' // Auto-publish for now as requested or set to pending if moderation is needed
    });

    // 4. Handle Tags
    if (tagIds) {
      const tagsArray = Array.isArray(tagIds) ? tagIds : [tagIds];
      await newAsset.setTags(tagsArray);
    }

    // 5. Handle Screenshots (to Cloudinary)
    if (files.screenshots) {
      const screenshotUrls = await Promise.all(
        files.screenshots.map(file => uploadToCloudinary(file.buffer, `uibrage/${userId}/${productId}/screenshots`))
      );
      
      const mediaEntries = screenshotUrls.map(url => ({
        assetId: newAsset.id,
        url,
        type: 'image'
      }));
      await AssetMedia.bulkCreate(mediaEntries);
    }

    res.status(201).json(newAsset);
  } catch (error) {
    console.error('--- UPLOAD FAILED ---');
    console.error('Error Name:', error.name);
    console.error('Error Code:', error.code || error.$metadata?.httpStatusCode);
    console.error('Full Error:', JSON.stringify(error, null, 2));
    
    const bucket = process.env.R2_BUCKET_NAME || 'uibrag';
    const errorMessage = error.name === 'UnexpectedResponse' || error.code === 'AccessDenied' || error.$metadata?.httpStatusCode === 403
      ? `Storage Error (R2/S3): ${error.message}. Bucket: "${bucket}". Please verify your R2 Token has "Edit" permissions and Account ID is correct.` 
      : error.message;
    res.status(500).json({ error: errorMessage, details: error });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, categoryId, engine, licenseType, isFree, tagIds } = req.body;
    
    const asset = await Asset.findByPk(id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    if (asset.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updateData = {
      title,
      description,
      price: isFree === 'true' ? 0 : parseFloat(price),
      categoryId: categoryId && categoryId !== 'undefined' ? parseInt(categoryId) : null,
      engine,
      licenseType,
      isFree: isFree === 'true'
    };

    await asset.update(updateData);

    if (tagIds) {
      const tagsArray = Array.isArray(tagIds) ? tagIds : [tagIds];
      await asset.setTags(tagsArray);
    }

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByPk(id, {
      include: [{ model: AssetMedia, as: 'media' }]
    });

    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    if (asset.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // 1. Delete from R2
    if (asset.fileUrl) {
      try {
        const url = new URL(asset.fileUrl);
        const key = url.pathname.substring(1); // Remove leading slash
        const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
        await r2.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || 'uibrag',
          Key: key
        }));
      } catch (e) {
        console.error('Error deleting from R2:', e);
      }
    }

    // 2. Delete Cover from Cloudinary
    if (asset.coverImageUrl) {
      try {
        // Extract public_id from URL
        const parts = asset.coverImageUrl.split('/');
        const fileName = parts[parts.length - 1].split('.')[0];
        const folder = parts[parts.length - 2];
        const publicId = `${folder}/${fileName}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.error('Error deleting cover from Cloudinary:', e);
      }
    }

    // 3. Delete Screenshots from Cloudinary
    if (asset.media && asset.media.length > 0) {
      for (const m of asset.media) {
        try {
          const parts = m.url.split('/');
          const fileName = parts[parts.length - 1].split('.')[0];
          // Screenshots might be nested deeper, better to use regex or store public_id
          // For now, assume same folder structure as covers or similar
          const folder = parts.slice(parts.indexOf('uibrage'), -1).join('/');
          const publicId = `${folder}/${fileName}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          console.error('Error deleting screenshot:', e);
        }
      }
    }

    await asset.destroy();
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset
};
