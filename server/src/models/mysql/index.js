const User = require('./User');
const Asset = require('./Asset');
const AssetMedia = require('./AssetMedia');
const Order = require('./Order');
const Category = require('./Category');
const Tag = require('./Tag');

// Relations
User.hasMany(Asset, { foreignKey: 'authorId' });
Asset.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

Asset.hasMany(AssetMedia, { as: 'media', foreignKey: 'assetId' });
AssetMedia.belongsTo(Asset, { foreignKey: 'assetId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Asset.hasMany(Order, { foreignKey: 'assetId' });
Order.belongsTo(Asset, { foreignKey: 'assetId' });

// Category Relations
Category.hasMany(Asset, { foreignKey: 'categoryId' });
Asset.belongsTo(Category, { as: 'categoryData', foreignKey: 'categoryId' });

// Tag Relations (Many-to-Many)
Asset.belongsToMany(Tag, { through: 'AssetTags', as: 'tags' });
Tag.belongsToMany(Asset, { through: 'AssetTags' });

module.exports = {
  User,
  Asset,
  AssetMedia,
  Order,
  Category,
  Tag
};
