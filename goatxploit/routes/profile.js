import express from 'express';
import { isLoggedIn } from '../middleware/auth.js';
import { showProfile, updateProfile, updatePassword } from '../controllers/profileController.js';

const router = express.Router();

router.get('/profile', isLoggedIn, showProfile);
router.post('/profile', isLoggedIn, updateProfile);
router.post('/profile/password', isLoggedIn, updatePassword);

export default router;
