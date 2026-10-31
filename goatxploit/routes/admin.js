import express from 'express';
import multer from 'multer';
import { isAdmin } from '../middleware/auth.js';
import {
  dashboard,
  listProducts,
  showCreateProduct,
  createProduct,
  showEditProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  createCategory,
  deleteCategory,
  listDeposits,
  showDeposit,
  approveDeposit,
  rejectDeposit,
  listUsers,
  updateUserRole,
  resetUserPassword,
  adjustBalance,
  listOrders
} from '../controllers/adminController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(isAdmin);

router.get('/', dashboard);
router.get('/products', listProducts);
router.get('/products/new', showCreateProduct);
router.post('/products', upload.single('thumbnail'), createProduct);
router.get('/products/:id/edit', showEditProduct);
router.post('/products/:id', upload.single('thumbnail'), updateProduct);
router.post('/products/:id/delete', deleteProduct);

router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.post('/categories/:id/delete', deleteCategory);

router.get('/deposits', listDeposits);
router.get('/deposits/:id', showDeposit);
router.post('/deposits/:id/approve', approveDeposit);
router.post('/deposits/:id/reject', rejectDeposit);

router.get('/users', listUsers);
router.post('/users/:id/role', updateUserRole);
router.post('/users/:id/reset-password', resetUserPassword);
router.post('/users/:id/balance', adjustBalance);

router.get('/orders', listOrders);

export default router;
