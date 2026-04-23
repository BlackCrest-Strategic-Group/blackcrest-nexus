import { Router } from 'express';
import { deleteWatchlist, listWatchlist, upsertWatchlist } from '../controllers/watchlistController.js';
import { authRequired } from '../middleware/auth.js';
import { enforceSeatLimits } from '../middleware/seatGate.js';

const router = Router();
router.get('/', authRequired, enforceSeatLimits, listWatchlist);
router.post('/', authRequired, enforceSeatLimits, upsertWatchlist);
router.delete('/:id', authRequired, enforceSeatLimits, deleteWatchlist);
export default router;
