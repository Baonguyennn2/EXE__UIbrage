const User = require('./User');
const Asset = require('./Asset');
const AssetMedia = require('./AssetMedia');
const Order = require('./Order');
const Category = require('./Category');
const Tag = require('./Tag');
const Post = require('./Post');
const PostComment = require('./PostComment');
const Follower = require('./Follower');

// Relations
User.hasMany(Asset, { as: 'Assets', foreignKey: 'authorId' });
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

// Wishlist Relations (Many-to-Many)
User.belongsToMany(Asset, { through: 'Wishlists', as: 'wishlist' });
Asset.belongsToMany(User, { through: 'Wishlists', as: 'wishlistedBy' });

// Community Relations
User.hasMany(Post, { foreignKey: 'authorId' });
Post.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

// Follower Relations
User.belongsToMany(User, { 
  as: 'Followers', 
  through: Follower, 
  foreignKey: 'followingId', 
  otherKey: 'followerId' 
});
User.belongsToMany(User, { 
  as: 'Following', 
  through: Follower, 
  foreignKey: 'followerId', 
  otherKey: 'followingId' 
});

module.exports = {
  User,
  Asset,
  AssetMedia,
  Order,
  Category,
  Tag,
  Post,
  Follower
};
