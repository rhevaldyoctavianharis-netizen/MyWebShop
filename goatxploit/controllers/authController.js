import db from '../models/index.js';

const { User } = db;

export function showRegister(req, res) {
  res.render('auth/register', { title: 'Register' });
}

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      req.session.flash = { type: 'error', message: 'Semua field wajib diisi.' };
      return res.redirect('/register');
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      req.session.flash = { type: 'error', message: 'Format email tidak valid.' };
      return res.redirect('/register');
    }

    if (password.length < 6) {
      req.session.flash = { type: 'error', message: 'Password minimal 6 karakter.' };
      return res.redirect('/register');
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      req.session.flash = { type: 'error', message: 'Email sudah terdaftar.' };
      return res.redirect('/register');
    }

    await User.create({ username, email, password });

    req.session.flash = { type: 'success', message: 'Registrasi berhasil, silakan login.' };
    return res.redirect('/login');
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Gagal melakukan registrasi.' };
    return res.redirect('/register');
  }
}

export function showLogin(req, res) {
  res.render('auth/login', { title: 'Login' });
}

export async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ email: identifier }, { username: identifier }]
      }
    });

    if (!user || !(await user.validatePassword(password))) {
      req.session.flash = { type: 'error', message: 'Kredensial tidak valid.' };
      return res.redirect('/login');
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return res.redirect(user.role === 'admin' ? '/admin' : '/products');
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Gagal login.' };
    return res.redirect('/login');
  }
}

export function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}
