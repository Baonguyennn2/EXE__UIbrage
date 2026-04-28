const PayOSModule = require('@payos/node');
const PayOS = PayOSModule.PayOS || PayOSModule.default || PayOSModule;
const { Asset, User } = require('../models/mysql');

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID || 'CLIENT_ID',
  process.env.PAYOS_API_KEY || 'API_KEY',
  process.env.PAYOS_CHECKSUM_KEY || 'CHECKSUM_KEY'
);

const createPaymentLink = async (req, res) => {
  try {
    const { assetId } = req.body;
    const { id: userId } = req.user;

    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.price === 0) {
      return res.status(400).json({ message: 'Asset is free' });
    }

    const orderCode = Number(String(Date.now()).slice(-6));

    const body = {
      orderCode: orderCode,
      amount: Math.round(asset.price * 25000), // Assuming price is in USD and converting roughly to VND since PayOS usually uses VND. Adjust as needed.
      description: `Asset ${assetId}`.substring(0, 25),
      returnUrl: `${process.env.CLIENT_ORIGIN}/payment/success`,
      cancelUrl: `${process.env.CLIENT_ORIGIN}/payment/cancel`,
    };

    const paymentLinkRes = await payos.createPaymentLink(body);

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
    const data = payos.verifyPaymentWebhookData(req.body);

    // Here you would typically grant access to the asset
    // by creating a record in a UserAssets or Purchases table
    
    res.json({ success: true });
  } catch (error) {
    console.error('PayOS Webhook Error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createPaymentLink,
  handleWebhook
};
