import crypto from 'crypto';

export function attachCsrfToken(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

export function verifyCsrf(req, res, next) {
  if (req.method !== 'POST') {
    return next();
  }

  const token = req.body?._csrf || req.headers['x-csrf-token'];
  if (!token || token !== req.session.csrfToken) {
    req.session.flash = { type: 'error', message: 'Token CSRF tidak valid.' };
    return res.redirect('back');
  }

  return next();
}
