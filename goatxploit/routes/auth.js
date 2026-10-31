import express from 'express';
import rateLimit from 'express-rate-limit';
import { isGuest, isLoggedIn } from '../middleware/auth.js';
import { showLogin, showRegister, register, login, logout } from '../controllers/authController.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Terlalu banyak percobaan login. Coba lagi 15 menit.'
});

router.get('/register', isGuest, showRegister);
router.post('/register', isGuest, register);
router.get('/login', isGuest, showLogin);
router.post('/login', isGuest, loginLimiter, login);
router.post('/logout', isLoggedIn, logout);

export default router;
