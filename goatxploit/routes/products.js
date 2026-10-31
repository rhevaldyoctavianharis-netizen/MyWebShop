import express from 'express';
import { isLoggedIn } from '../middleware/auth.js';
import { listProducts, showProduct, buyProduct } from '../controllers/productsController.js';

const router = express.Router();

router.get('/products', isLoggedIn, listProducts);
router.get('/products/:slug', isLoggedIn, showProduct);
router.post('/products/:id/buy', isLoggedIn, buyProduct);

export default router;
