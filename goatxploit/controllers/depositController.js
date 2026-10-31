import db from '../models/index.js';

const { Deposit } = db;

export function showDepositForm(req, res) {
  res.render('deposit/form', {
    title: 'Deposit',
    bankAccount: process.env.BANK_ACCOUNT,
    danaNumber: process.env.DANA_NUMBER,
    qrisImageUrl: process.env.QRIS_IMAGE_URL
  });
}

export async function createDeposit(req, res) {
  try {
    const amount = Number(req.body.amount);
    const { method } = req.body;

    if (!amount || amount < 10000 || amount % 1000 !== 0) {
      req.session.flash = { type: 'error', message: 'Nominal minimal 10.000 dan kelipatan 1.000.' };
      return res.redirect('/deposit');
    }

    if (!['BCA', 'DANA', 'QRIS'].includes(method)) {
      req.session.flash = { type: 'error', message: 'Metode deposit tidak valid.' };
      return res.redirect('/deposit');
    }

    if (!req.file) {
      req.session.flash = { type: 'error', message: 'Upload bukti transfer wajib.' };
      return res.redirect('/deposit');
    }

    await Deposit.create({
      userId: req.session.user.id,
      amount,
      method,
      proofUrl: `/uploads/${req.file.filename}`,
      status: 'PENDING'
    });

    req.session.flash = { type: 'success', message: 'Deposit dibuat dan menunggu review admin.' };
    return res.redirect('/deposits');
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Gagal membuat deposit.' };
    return res.redirect('/deposit');
  }
}

export async function depositHistory(req, res) {
  const deposits = await Deposit.findAll({
    where: { userId: req.session.user.id },
    order: [['createdAt', 'DESC']]
  });

  return res.render('deposit/history', { title: 'Riwayat Deposit', deposits });
}
