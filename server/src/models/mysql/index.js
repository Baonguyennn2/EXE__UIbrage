const User = require('./User');
const Asset = require('./Asset');
const AssetMedia = require('./AssetMedia');
const Order = require('./Order');

// Relations
User.hasMany(Asset, { foreignKey: 'authorId' });
Asset.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

Asset.hasMany(AssetMedia, { as: 'media', foreignKey: 'assetId' });
AssetMedia.belongsTo(Asset, { foreignKey: 'assetId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Asset.hasMany(Order, { foreignKey: 'assetId' });
Order.belongsTo(Asset, { foreignKey: 'assetId' });

module.exports = {
  User,
  Asset,
  AssetMedia,
  Order,
};
