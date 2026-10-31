import db from '../models/index.js';

const { User } = db;

export async function showProfile(req, res) {
  const user = await User.findByPk(req.session.user.id);
  return res.render('profile/edit', { title: 'Profil', user });
}

export async function updateProfile(req, res) {
  try {
    const { username } = req.body;
    if (!username) {
      req.session.flash = { type: 'error', message: 'Nama wajib diisi.' };
      return res.redirect('/profile');
    }

    const user = await User.findByPk(req.session.user.id);
    user.username = username;
    await user.save();

    req.session.user.username = user.username;
    req.session.flash = { type: 'success', message: 'Profil berhasil diperbarui.' };
    return res.redirect('/profile');
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Gagal memperbarui profil.' };
    return res.redirect('/profile');
  }
}

export async function updatePassword(req, res) {
  try {
    const { password, confirmPassword } = req.body;
    if (!password || password.length < 6 || password !== confirmPassword) {
      req.session.flash = { type: 'error', message: 'Password tidak valid atau konfirmasi tidak cocok.' };
      return res.redirect('/profile');
    }

    const user = await User.findByPk(req.session.user.id);
    user.password = password;
    await user.save();

    req.session.flash = { type: 'success', message: 'Password berhasil diperbarui.' };
    return res.redirect('/profile');
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Gagal mengganti password.' };
    return res.redirect('/profile');
  }
}
