const User = require('./User');
const User = require('./User');
const Asset = require('./Asset');
const AssetMedia = require('./AssetMedia');
const Order = require('./Order');
const RevenueLedger = require('./RevenueLedger');
const WithdrawalRequest = require('./WithdrawalRequest');
const PlatformSetting = require('./PlatformSetting');
const Category = require('./Category');
const Tag = require('./Tag');
const Post = require('./Post');
const PostComment = require('./PostComment');
const Follower = require('./Follower');

User.hasMany(Asset, { as: 'Assets', foreignKey: 'authorId' });
Asset.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

Asset.hasMany(AssetMedia, { as: 'media', foreignKey: 'assetId' });
AssetMedia.belongsTo(Asset, { foreignKey: 'assetId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Asset.hasMany(Order, { foreignKey: 'assetId' });
Order.belongsTo(Asset, { foreignKey: 'assetId' });

User.hasMany(RevenueLedger, { as: 'RevenueLedgers', foreignKey: 'userId' });
RevenueLedger.belongsTo(User, { as: 'creator', foreignKey: 'userId' });

Asset.hasMany(RevenueLedger, { as: 'RevenueLedgers', foreignKey: 'assetId' });
RevenueLedger.belongsTo(Asset, { as: 'asset', foreignKey: 'assetId' });

Order.hasMany(RevenueLedger, { as: 'ledgerEntries', foreignKey: 'orderId' });
RevenueLedger.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });

User.hasMany(WithdrawalRequest, { as: 'withdrawalRequests', foreignKey: 'userId' });
WithdrawalRequest.belongsTo(User, { as: 'creator', foreignKey: 'userId' });

Category.hasMany(Asset, { foreignKey: 'categoryId' });
Asset.belongsTo(Category, { as: 'categoryData', foreignKey: 'categoryId' });

Asset.belongsToMany(Tag, { through: 'AssetTags', as: 'tags' });
Tag.belongsToMany(Asset, { through: 'AssetTags' });

User.belongsToMany(Asset, { through: 'Wishlists', as: 'wishlist' });
Asset.belongsToMany(User, { through: 'Wishlists', as: 'wishlistedBy' });

User.hasMany(Post, { foreignKey: 'authorId' });
Post.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

User.belongsToMany(User, {
  as: 'Followers',
  through: Follower,
  foreignKey: 'followingId',
  otherKey: 'followerId',
});
User.belongsToMany(User, {
  as: 'Following',
  through: Follower,
  foreignKey: 'followerId',
  otherKey: 'followingId',
});

module.exports = {
  User,
  Asset,
  AssetMedia,
  Order,
  RevenueLedger,
  WithdrawalRequest,
  PlatformSetting,
  Category,
  Tag,
  Post,
  PostComment,
  Follower,
};
  Follower
