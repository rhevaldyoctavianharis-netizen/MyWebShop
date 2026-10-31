import express from 'express';
import { isLoggedIn } from '../middleware/auth.js';
import { orderHistory } from '../controllers/ordersController.js';

const router = express.Router();

router.get('/orders', isLoggedIn, orderHistory);

export default router;
