const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CreatorWallet = sequelize.define('CreatorWallet', {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  availableBalance: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  pendingWithdrawalBalance: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  lifetimeEarnings: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  totalWithdrawn: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
}, {
  timestamps: true,
});

module.exports = CreatorWallet;