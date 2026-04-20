import { Router } from 'express';
import { analyzeCategory, deleteCategorySnapshot, listCategorySnapshots, saveCategorySnapshot } from '../controllers/categoryController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.post('/analyze', authRequired, analyzeCategory);
router.post('/save', authRequired, saveCategorySnapshot);
router.get('/history', authRequired, listCategorySnapshots);
router.delete('/:id', authRequired, deleteCategorySnapshot);
export default router;
