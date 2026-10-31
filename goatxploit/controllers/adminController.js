import bcrypt from 'bcrypt';
import { Op, fn, col } from 'sequelize';
import db from '../models/index.js';
import { createSlug } from '../utils/slugify.js';

const { User, Product, Category, Deposit, Order, OrderItem, BalanceLog } = db;

export async function dashboard(req, res) {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenue,
    pendingDeposits,
    orderStats
  ] = await Promise.all([
    User.count(),
    Product.count(),
    Order.count(),
    Order.sum('totalAmount'),
    Deposit.count({ where: { status: 'PENDING' } }),
    Order.findAll({
      attributes: [[fn('date', col('createdAt')), 'day'], [fn('sum', col('totalAmount')), 'total']],
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000))
        }
      },
      group: [fn('date', col('createdAt'))],
      raw: true
    })
  ]);

  return res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    stats: { totalUsers, totalProducts, totalOrders, revenue: revenue || 0, pendingDeposits },
    chartData: orderStats
  });
}

export async function listProducts(req, res) {
  const products = await Product.findAll({
    include: [Category],
    paranoid: false,
    order: [['createdAt', 'DESC']]
  });
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  return res.render('admin/products/index', { title: 'Admin Produk', products, categories });
}

export async function showCreateProduct(req, res) {
  const categories = await Category.findAll();
  return res.render('admin/products/form', { title: 'Tambah Produk', product: null, categories });
}

export async function createProduct(req, res) {
  try {
    const { name, description, price, stock, categoryId, fileUrl } = req.body;
    const slug = createSlug(name);
    const finalSlug = `${slug}-${Date.now().toString().slice(-5)}`;

    await Product.create({
      name,
      slug: finalSlug,
      description,
      price: Number(price),
      stock: Number(stock),
      categoryId: Number(categoryId),
      fileUrl: fileUrl || null,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : null,
      isActive: true
    });

    req.session.flash = { type: 'success', message: 'Produk berhasil dibuat.' };
    return res.redirect('/admin/products');
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Gagal membuat produk.' };
    return res.redirect('/admin/products/new');
  }
}

export async function showEditProduct(req, res) {
  const product = await Product.findByPk(req.params.id);
  const categories = await Category.findAll();
  if (!product) return res.redirect('/admin/products');
  return res.render('admin/products/form', { title: 'Edit Produk', product, categories });
}

export async function updateProduct(req, res) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.redirect('/admin/products');

    product.name = req.body.name;
    product.slug = createSlug(req.body.name);
    product.description = req.body.description;
    product.price = Number(req.body.price);
    product.stock = Number(req.body.stock);
    product.categoryId = Number(req.body.categoryId);
    product.fileUrl = req.body.fileUrl || null;
    product.isActive = req.body.isActive === 'on';
    if (req.file) product.thumbnail = `/uploads/${req.file.filename}`;

    await product.save();
    req.session.flash = { type: 'success', message: 'Produk berhasil diperbarui.' };
    return res.redirect('/admin/products');
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Gagal memperbarui produk.' };
    return res.redirect('/admin/products');
  }
}

export async function deleteProduct(req, res) {
  const product = await Product.findByPk(req.params.id);
  if (product) await product.destroy();
  req.session.flash = { type: 'success', message: 'Produk berhasil dihapus (soft delete).' };
  return res.redirect('/admin/products');
}

export async function listCategories(req, res) {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  return res.render('admin/categories/index', { title: 'Kategori', categories });
}

export async function createCategory(req, res) {
  try {
    const name = req.body.name?.trim();
    if (!name) throw new Error('invalid');
    await Category.create({ name, slug: createSlug(name) });
    req.session.flash = { type: 'success', message: 'Kategori berhasil ditambahkan.' };
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Gagal menambah kategori.' };
  }
  return res.redirect('/admin/categories');
}

export async function deleteCategory(req, res) {
  await Category.destroy({ where: { id: req.params.id } });
  req.session.flash = { type: 'success', message: 'Kategori dihapus.' };
  return res.redirect('/admin/categories');
}

export async function listDeposits(req, res) {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  const deposits = await Deposit.findAll({
    where,
    include: [{ model: User }, { model: User, as: 'reviewer' }],
    order: [['createdAt', 'DESC']]
  });
  return res.render('admin/deposits/index', { title: 'Admin Deposit', deposits, filter: req.query.status || '' });
}

export async function showDeposit(req, res) {
  const deposit = await Deposit.findByPk(req.params.id, { include: [{ model: User }] });
  if (!deposit) return res.redirect('/admin/deposits');
  return res.render('admin/deposits/show', { title: 'Detail Deposit', deposit });
}

export async function approveDeposit(req, res) {
  const t = await db.sequelize.transaction();
  try {
    const deposit = await Deposit.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!deposit || deposit.status !== 'PENDING') {
      await t.rollback();
      return res.redirect('/admin/deposits');
    }

    const user = await User.findByPk(deposit.userId, { transaction: t, lock: t.LOCK.UPDATE });
    user.balance += deposit.amount;
    deposit.status = 'APPROVED';
    deposit.note = req.body.note || null;
    deposit.reviewedBy = req.session.user.id;

    await user.save({ transaction: t });
    await deposit.save({ transaction: t });
    await BalanceLog.create({
      userId: user.id,
      type: 'DEPOSIT',
      amount: deposit.amount,
      note: `Approve deposit #${deposit.id}`
    }, { transaction: t });

    await t.commit();
    req.session.flash = { type: 'success', message: 'Deposit berhasil di-approve.' };
    return res.redirect('/admin/deposits');
  } catch (error) {
    await t.rollback();
    req.session.flash = { type: 'error', message: 'Gagal approve deposit.' };
    return res.redirect('/admin/deposits');
  }
}

export async function rejectDeposit(req, res) {
  const deposit = await Deposit.findByPk(req.params.id);
  if (deposit && deposit.status === 'PENDING') {
    deposit.status = 'REJECTED';
    deposit.note = req.body.note || 'Deposit ditolak admin';
    deposit.reviewedBy = req.session.user.id;
    await deposit.save();
  }
  req.session.flash = { type: 'warning', message: 'Deposit ditolak.' };
  return res.redirect('/admin/deposits');
}

export async function listUsers(req, res) {
  const users = await User.findAll({ order: [['createdAt', 'DESC']] });
  return res.render('admin/users/index', { title: 'Manajemen User', users });
}

export async function updateUserRole(req, res) {
  const user = await User.findByPk(req.params.id);
  if (user) {
    user.role = req.body.role;
    await user.save();
    req.session.flash = { type: 'success', message: 'Role user diperbarui.' };
  }
  return res.redirect('/admin/users');
}

export async function resetUserPassword(req, res) {
  const user = await User.findByPk(req.params.id);
  if (user) {
    user.password = req.body.password || 'Password123!';
    await user.save();
    req.session.flash = { type: 'success', message: 'Password user berhasil direset.' };
  }
  return res.redirect('/admin/users');
}

export async function adjustBalance(req, res) {
  const t = await db.sequelize.transaction();
  try {
    const user = await User.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    const amount = Number(req.body.amount || 0);
    if (!user || !amount) throw new Error('invalid');

    user.balance += amount;
    if (user.balance < 0) throw new Error('negative balance');

    await user.save({ transaction: t });
    await BalanceLog.create({
      userId: user.id,
      type: 'ADJUSTMENT',
      amount,
      note: req.body.note || `Admin adjustment oleh ${req.session.user.email}`
    }, { transaction: t });

    await t.commit();
    req.session.flash = { type: 'success', message: 'Saldo user berhasil diubah.' };
    return res.redirect('/admin/users');
  } catch (error) {
    await t.rollback();
    req.session.flash = { type: 'error', message: 'Gagal mengubah saldo user.' };
    return res.redirect('/admin/users');
  }
}

export async function listOrders(req, res) {
  const orders = await Order.findAll({
    include: [
      { model: User },
      { model: OrderItem, include: [Product] }
    ],
    order: [['createdAt', 'DESC']]
  });
  return res.render('admin/orders/index', { title: 'Semua Order', orders });
}
