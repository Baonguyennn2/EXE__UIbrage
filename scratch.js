const { User, Asset, Order } = require('./server/src/models/mysql');

async function test() {
  const orders = await Order.findAll({
    where: { status: 'completed' },
    include: [
      { 
        model: Asset,
        include: [{ model: User, as: 'author', attributes: ['username', 'fullName'] }]
      }
    ],
  });

  console.log("Found orders:", orders.length);
  if (orders.length > 0) {
    const order = orders[0];
    console.log("Keys on order instance:", Object.keys(order.toJSON()));
    console.log("order.Asset:", !!order.Asset);
    console.log("order.asset:", !!order.asset);
    
    const purchasedAssets = orders.map(o => o.Asset || o.asset).filter(a => a != null);
    console.log("Purchased assets extracted:", purchasedAssets.length);
  }
}

test().catch(console.error).finally(() => process.exit());
