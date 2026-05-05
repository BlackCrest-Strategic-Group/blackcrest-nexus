import express from 'express';
import Job from '../models/Job.js';

const router = express.Router();
router.get('/:id', async (req, res) => {
  const job = await Job.findById(req.params.id).lean();
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ status: job.status, result: job.result });
});
export default router;
