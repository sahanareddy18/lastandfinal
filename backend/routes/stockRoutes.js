// routes/stockRoutes.js
import express from 'express';
import {
  addStockFromPurchase,
  getAllStock,
  updateStock,
  deleteStock,
  getRackManagement,
  updateStockDiscounts
} from '../controllers/stockController.js';

const router = express.Router();

// Stock management routes
router.post('/add-stock', addStockFromPurchase);
router.get('/', getAllStock);
router.put('/:id', updateStock);
router.delete('/:id', deleteStock);
router.get('/rack-management', getRackManagement);
router.post('/update-discounts', updateStockDiscounts);

export default router;