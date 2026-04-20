import { Router } from 'express';
import { deleteWatchlist, listWatchlist, upsertWatchlist } from '../controllers/watchlistController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.get('/', authRequired, listWatchlist);
router.post('/', authRequired, upsertWatchlist);
router.delete('/:id', authRequired, deleteWatchlist);
export default router;
