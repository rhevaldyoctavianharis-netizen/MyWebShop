import db from '../models/index.js';

const { Order, OrderItem, Product } = db;

export async function orderHistory(req, res) {
  const orders = await Order.findAll({
    where: { userId: req.session.user.id },
    include: [{
      model: OrderItem,
      include: [{ model: Product, paranoid: false }]
    }],
    order: [['createdAt', 'DESC']]
  });

  return res.render('orders/index', { title: 'Riwayat Order', orders });
}
