const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const WithdrawalRequest = sequelize.define('WithdrawalRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  payoutMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'bank',
  },
  payoutDetails: {
    type: DataTypes.TEXT,
  },
  note: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
  adminNote: {
    type: DataTypes.TEXT,
  },
  reviewedBy: {
    type: DataTypes.STRING,
  },
  reviewedAt: {
    type: DataTypes.DATE,
  },
  transactionId: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});

module.exports = WithdrawalRequest;