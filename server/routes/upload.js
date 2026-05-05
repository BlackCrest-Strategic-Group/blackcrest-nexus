import express from 'express';
import { authRequired } from '../middleware/auth.js';
import Job from '../models/Job.js';

const router = express.Router();

router.post('/', authRequired, async (req, res) => {
  const input = req.body.text || '';
  const job = await Job.create({ userId: req.user.id, status: 'queued', input });
  setTimeout(async () => {
    job.status = 'processing';
    await job.save();
    setTimeout(async () => {
      job.status = 'done';
      job.result = `Processed ${Math.max(input.length, 1)} characters.`;
      await job.save();
    }, 1200);
  }, 200);
  res.json({ jobId: job._id, status: job.status });
});

export default router;
