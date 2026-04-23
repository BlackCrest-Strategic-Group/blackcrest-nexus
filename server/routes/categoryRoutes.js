import { Router } from 'express';
import { analyzeCategory, deleteCategorySnapshot, listCategorySnapshots, saveCategorySnapshot } from '../controllers/categoryController.js';
import { authRequired } from '../middleware/auth.js';
import { enforceSeatLimits } from '../middleware/seatGate.js';

const router = Router();
router.post('/analyze', authRequired, enforceSeatLimits, analyzeCategory);
router.post('/save', authRequired, enforceSeatLimits, saveCategorySnapshot);
router.get('/history', authRequired, enforceSeatLimits, listCategorySnapshots);
router.delete('/:id', authRequired, enforceSeatLimits, deleteCategorySnapshot);
export default router;
