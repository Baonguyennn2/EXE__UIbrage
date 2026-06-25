const { PayOS } = require('@payos/node');
const { Asset, User, Order } = require('../models/mysql');
const Notification = require('../models/mongodb/Notification');
const sequelize = require('../config/database');
const { getCommissionPercent, createSaleLedger, roundMoney } = require('../utils/finance');

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || 'CLIENT_ID',
  apiKey: process.env.PAYOS_API_KEY || 'API_KEY',
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || 'CHECKSUM_KEY'
});

const createPaymentLink = async (req, res) => {
  try {
    const { assetId } = req.body;
    const { id: userId } = req.user;

    const asset = await Asset.findByPk(assetId, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fullName'] }],
    });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const basePrice = roundMoney(asset.price);

    if (basePrice === 0) {
      const orderCode = Number(String(Date.now()).slice(-6));
      await Order.create({
        userId,
        assetId,
        amount: 0,
        transactionId: String(orderCode),
        status: 'completed',
      });
      return res.json({
        isFree: true,
        orderCode: orderCode,
        message: 'Asset claimed successfully'
      });
    }

    const commissionPercent = await getCommissionPercent();
    const grossAmountUsd = roundMoney(basePrice * (1 + commissionPercent / 100));
    const orderCode = Number(String(Date.now()).slice(-6));

    await Order.create({
      userId,
      assetId,
      amount: grossAmountUsd,
      transactionId: String(orderCode),
      status: 'pending',
    });

    const body = {
      orderCode: orderCode,
      amount: Math.round(grossAmountUsd * 25000),
      description: `Asset ${assetId}`.substring(0, 25),
      returnUrl: `${process.env.CLIENT_ORIGIN}/marketplace/order-success?orderCode=${orderCode}`,
      cancelUrl: `${process.env.CLIENT_ORIGIN}/marketplace/checkout?canceled=true`,
    };

    const paymentLinkRes = await payos.paymentRequests.create(body);

    res.json({
      checkoutUrl: paymentLinkRes.checkoutUrl,
      orderCode: orderCode
    });
  } catch (error) {
    console.error('PayOS Create Payment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const data = payos.webhooks.verify(req.body);
    const orderCode = String(data.orderCode || data.data?.orderCode || req.body.orderCode || req.body?.data?.orderCode || '');

    const order = await Order.findOne({ where: { transactionId: orderCode } });
    if (!order) {
      return res.json({ success: true, message: 'Order not found, webhook ignored' });
    }

    if (order.status === 'completed') {
      return res.json({ success: true, message: 'Webhook already processed' });
    }

    const asset = await Asset.findByPk(order.assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const commissionPercent = await getCommissionPercent();

    await sequelize.transaction(async (transaction) => {
      order.status = 'completed';
      await order.save({ transaction });

      const { ledgerEntry, split } = await createSaleLedger({
        userId: asset.authorId,
        assetId: asset.id,
        orderId: order.id,
        basePrice: asset.price,
        commissionPercent,
        createdBy: req.user?.id || asset.authorId,
      });

      await Notification.create({
        userId: asset.authorId,
        type: 'new_order',
        title: 'New sale recorded',
        message: `Your asset "${asset.title}" sold for $${split.grossAmount.toFixed(2)}. Creator share $${split.creatorAmount.toFixed(2)} has been added to your balance.`,
        relatedId: asset.id,
      });

      return ledgerEntry;
    });

    // Here you would typically grant access to the asset
    // by creating a record in a UserAssets or Purchases table
    
    res.json({ success: true });
  } catch (error) {
    console.error('PayOS Webhook Error:', error);
    res.status(400).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { orderCode } = req.params;
    
    // Check if we already processed it
    const order = await Order.findOne({ where: { transactionId: orderCode } });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (Number(order.amount) === 0) {
      return res.json({
        orderId: order.id,
        assetId: order.assetId,
        status: order.status,
        amount: order.amount,
        transactionId: order.transactionId
      });
    }
    
    // Always fetch latest status from PayOS for paid orders
    const paymentInfo = await payos.paymentRequests.get(orderCode);
    
    if (paymentInfo.status === 'PAID' && order.status === 'pending') {
      const asset = await Asset.findByPk(order.assetId);
      const commissionPercent = await getCommissionPercent();

      await sequelize.transaction(async (transaction) => {
        order.status = 'completed';
        await order.save({ transaction });

        const { split } = await createSaleLedger({
          userId: asset.authorId,
          assetId: asset.id,
          orderId: order.id,
          basePrice: asset.price,
          commissionPercent,
          createdBy: req.user?.id || asset.authorId,
        });

        await Notification.create({
          userId: asset.authorId,
          type: 'new_order',
          title: 'New sale recorded',
          message: `Your asset "${asset.title}" sold for $${split.grossAmount.toFixed(2)}. Creator share $${split.creatorAmount.toFixed(2)} has been added to your balance.`,
          relatedId: asset.id,
        });
      });
    }
    
    res.json({
      orderId: order.id,
      assetId: order.assetId,
      status: paymentInfo.status === 'PAID' ? 'completed' : order.status,
      amount: order.amount,
      transactionId: order.transactionId
    });
  } catch (error) {
    console.error('PayOS Verification Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPaymentLink,
  handleWebhook,
  verifyPayment
};
