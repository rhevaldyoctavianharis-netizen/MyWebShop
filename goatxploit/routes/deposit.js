import express from 'express';
import multer from 'multer';
import path from 'path';
import { isLoggedIn } from '../middleware/auth.js';
import { showDepositForm, createDeposit, depositHistory } from '../controllers/depositController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      return cb(new Error('File harus JPG/PNG'));
    }
    return cb(null, true);
  }
});

router.get('/deposit', isLoggedIn, showDepositForm);
router.post('/deposit', isLoggedIn, upload.single('proof'), createDeposit);
router.get('/deposits', isLoggedIn, depositHistory);

export default router;
