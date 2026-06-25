const { PlatformSetting, RevenueLedger, WithdrawalRequest } = require('../models/mysql');

const COMMISSION_KEY = 'platform_commission_percent';

function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function roundMoney(value) {
  return Math.round(toNumber(value) * 100) / 100;
}

async function getCommissionPercent() {
  const [setting] = await PlatformSetting.findOrCreate({
    where: { key: COMMISSION_KEY },
    defaults: { key: COMMISSION_KEY, commissionPercent: 5 },
  });

  return toNumber(setting.commissionPercent || 5);
}

async function setCommissionPercent(percent, updatedBy) {
  const [setting] = await PlatformSetting.findOrCreate({
    where: { key: COMMISSION_KEY },
    defaults: { key: COMMISSION_KEY, commissionPercent: 5 },
  });

  setting.commissionPercent = roundMoney(percent);
  setting.updatedBy = updatedBy || null;
  await setting.save();
  return setting;
}

function calculateSplit(basePrice, commissionPercent) {
  const creatorAmount = roundMoney(basePrice);
  const grossAmount = roundMoney(creatorAmount * (1 + toNumber(commissionPercent) / 100));
  const platformAmount = roundMoney(grossAmount - creatorAmount);

  return {
    creatorAmount,
    grossAmount,
    platformAmount,
    commissionPercent: roundMoney(commissionPercent),
  };
}

async function getCreatorFinancials(userId) {
  const totalEarnings = roundMoney(await RevenueLedger.sum('creatorAmount', {
    where: { userId, type: 'sale_credit' },
  }) || 0);

  const grossRevenue = roundMoney(await RevenueLedger.sum('grossAmount', {
    where: { userId, type: 'sale_credit' },
  }) || 0);

  const platformRevenue = roundMoney(await RevenueLedger.sum('platformAmount', {
    where: { userId, type: 'sale_credit' },
  }) || 0);

  const approvedWithdrawals = roundMoney(await RevenueLedger.sum('balanceDelta', {
    where: { userId, type: 'withdrawal_approved' },
  }) || 0);

  const currentBalance = roundMoney(await RevenueLedger.sum('balanceDelta', {
    where: { userId },
  }) || 0);

  const pendingWithdrawalAmount = roundMoney(await WithdrawalRequest.sum('amount', {
    where: { userId, status: 'pending' },
  }) || 0);

  const totalWithdrawn = roundMoney(await WithdrawalRequest.sum('amount', {
    where: { userId, status: 'approved' },
  }) || 0);

  const totalSales = await RevenueLedger.count({
    where: { userId, type: 'sale_credit' },
  });

  return {
    totalEarnings,
    grossRevenue,
    platformRevenue,
    approvedWithdrawals,
    currentBalance,
    pendingWithdrawalAmount,
    availableBalance: roundMoney(currentBalance - pendingWithdrawalAmount),
    totalWithdrawn,
    totalSales,
  };
}

async function createSaleLedger({ userId, assetId, orderId, basePrice, commissionPercent, createdBy, transaction }) {
  const split = calculateSplit(basePrice, commissionPercent);
  const [ledgerEntry, created] = await RevenueLedger.findOrCreate({
    where: { orderId, type: 'sale_credit' },
    defaults: {
      userId,
      assetId,
      orderId,
      type: 'sale_credit',
      grossAmount: split.grossAmount,
      creatorAmount: split.creatorAmount,
      platformAmount: split.platformAmount,
      balanceDelta: split.creatorAmount,
      note: `Sale credited with ${split.commissionPercent}% commission`,
      createdBy: createdBy || null,
    },
    transaction
  });

  return { ledgerEntry, created, split };
}

module.exports = {
  COMMISSION_KEY,
  roundMoney,
  getCommissionPercent,
  setCommissionPercent,
  calculateSplit,
  getCreatorFinancials,
  createSaleLedger,
};