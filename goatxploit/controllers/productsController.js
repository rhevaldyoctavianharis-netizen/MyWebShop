import { Op } from 'sequelize';
import db from '../models/index.js';
import { generateLicenseKey } from '../utils/license.js';

const { Product, Category, User, Order, OrderItem, BalanceLog } = db;

export async function listProducts(req, res) {
  const { q, category } = req.query;
  const likeOperator = db.sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;

  const where = { isActive: true, stock: { [Op.gt]: 0 } };
  if (q) {
    where.name = { [likeOperator]: `%${q}%` };
  }
  if (category) {
    where.categoryId = category;
  }

  const [products, categories] = await Promise.all([
    Product.findAll({ where, include: [Category], order: [['createdAt', 'DESC']] }),
    Category.findAll({ order: [['name', 'ASC']] })
  ]);

  return res.render('products/index', {
    title: 'Produk',
    products,
    categories,
    filters: { q: q || '', category: category || '' }
  });
}

export async function showProduct(req, res, next) {
  const product = await Product.findOne({
    where: { slug: req.params.slug, isActive: true },
    include: [Category]
  });

  if (!product) return next();

  return res.render('products/show', { title: product.name, product });
}

export async function buyProduct(req, res) {
  const t = await db.sequelize.transaction();
  try {
    const product = await Product.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    const user = await User.findByPk(req.session.user.id, { transaction: t, lock: t.LOCK.UPDATE });

    if (!product || !product.isActive || product.stock < 1) {
      await t.rollback();
      req.session.flash = { type: 'error', message: 'Produk tidak tersedia.' };
      return res.redirect('/products');
    }

    if (user.balance < product.price) {
      await t.rollback();
      req.session.flash = { type: 'warning', message: 'Saldo credit tidak cukup. Silakan deposit.' };
      return res.redirect('/deposit');
    }

    user.balance -= product.price;
    product.stock -= 1;

    const order = await Order.create({
      userId: user.id,
      totalAmount: product.price,
      status: 'COMPLETED'
    }, { transaction: t });

    await OrderItem.create({
      orderId: order.id,
      productId: product.id,
      price: product.price,
      licenseKey: generateLicenseKey()
    }, { transaction: t });

    await BalanceLog.create({
      userId: user.id,
      type: 'PURCHASE',
      amount: -product.price,
      note: `Pembelian produk ${product.name}`
    }, { transaction: t });

    await user.save({ transaction: t });
    await product.save({ transaction: t });
    await t.commit();

    req.session.flash = { type: 'success', message: 'Pembelian berhasil. Cek riwayat order.' };
    return res.redirect('/orders');
  } catch (error) {
    await t.rollback();
    req.session.flash = { type: 'error', message: 'Gagal memproses pembelian.' };
    return res.redirect('/products');
  }
}
