const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const RevenueLedger = sequelize.define('RevenueLedger', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  assetId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  withdrawalRequestId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM(
      'sale_credit',
      'withdrawal_request',
      'withdrawal_approved',
      'withdrawal_rejected',
      'adjustment'
    ),
    allowNull: false,
  },
  grossAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  creatorAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  platformAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  balanceDelta: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = RevenueLedger;