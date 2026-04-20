import { Router } from 'express';
import { getHistory, getProfile, updatePreferences, updateUser } from '../controllers/profileController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.get('/profile', authRequired, getProfile);
router.put('/profile', authRequired, updateUser);
router.put('/settings', authRequired, updatePreferences);
router.get('/history', authRequired, getHistory);
export default router;
