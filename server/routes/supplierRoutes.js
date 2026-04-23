import { Router } from 'express';
import { analyzeSupplier, compareSuppliers, createSupplier, deleteSupplier, getSupplier, listSuppliers, saveSupplierAnalysis } from '../controllers/supplierController.js';
import { authRequired } from '../middleware/auth.js';
import { enforceSeatLimits } from '../middleware/seatGate.js';

const router = Router();
router.post('/', authRequired, enforceSeatLimits, createSupplier);
router.get('/', authRequired, enforceSeatLimits, listSuppliers);
router.get('/:id', authRequired, enforceSeatLimits, getSupplier);
router.post('/:id/analyze', authRequired, enforceSeatLimits, analyzeSupplier);
router.post('/analysis/save', authRequired, enforceSeatLimits, saveSupplierAnalysis);
router.post('/compare', authRequired, enforceSeatLimits, compareSuppliers);
router.delete('/:id', authRequired, enforceSeatLimits, deleteSupplier);
export default router;
