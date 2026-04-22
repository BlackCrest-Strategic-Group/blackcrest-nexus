import { Router } from 'express';
import { getRoles, login, logout, profile, register, updateProfile } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.get('/roles', getRoles);
router.post('/login', login);
router.post('/logout', authRequired, logout);
router.get('/profile', authRequired, profile);
router.patch('/profile', authRequired, updateProfile);
export default router;
