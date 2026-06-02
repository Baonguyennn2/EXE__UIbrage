const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const RevenueTransaction = sequelize.define('RevenueTransaction', {
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
    type: DataTypes.ENUM('sale_credit', 'withdrawal_request', 'withdrawal_approved', 'withdrawal_rejected', 'fee_credit', 'adjustment'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  grossAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  feeAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'rejected'),
    defaultValue: 'completed',
  },
  note: {
    type: DataTypes.TEXT,
  },
  metadata: {
    type: DataTypes.JSON,
  },
}, {
  timestamps: true,
});

module.exports = RevenueTransaction;