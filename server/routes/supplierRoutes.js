import { Router } from 'express';
import { analyzeSupplier, compareSuppliers, createSupplier, deleteSupplier, getSupplier, listSuppliers, saveSupplierAnalysis } from '../controllers/supplierController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.post('/', authRequired, createSupplier);
router.get('/', authRequired, listSuppliers);
router.get('/:id', authRequired, getSupplier);
router.post('/:id/analyze', authRequired, analyzeSupplier);
router.post('/analysis/save', authRequired, saveSupplierAnalysis);
router.post('/compare', authRequired, compareSuppliers);
router.delete('/:id', authRequired, deleteSupplier);
export default router;
