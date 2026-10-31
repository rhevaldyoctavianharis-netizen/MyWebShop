export function isLoggedIn(req, res, next) {
  if (!req.session.user) {
    req.session.flash = { type: 'error', message: 'Silakan login terlebih dahulu.' };
    return res.redirect('/login');
  }
  return next();
}

export function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.session.flash = { type: 'error', message: 'Akses admin diperlukan.' };
    return res.redirect('/');
  }
  return next();
}

export function isGuest(req, res, next) {
  if (req.session.user) {
    return res.redirect('/products');
  }
  return next();
}
