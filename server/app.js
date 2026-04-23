import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import blanketPoRoutes from './routes/blanketPoRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import sentinelRoutes from './routes/sentinelRoutes.js';
import { cleanRoomCompliance } from '../middleware/cleanRoomCompliance.js';
import { auditTrail } from './middleware/auditTrail.js';
import crypto from 'crypto';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({
  limit: '5mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);
  return next();
});
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 400 }));
app.use('/api', cleanRoomCompliance);
app.use(auditTrail);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/category-intelligence', categoryRoutes);
app.use('/api/supplier-intelligence', supplierRoutes);
app.use('/api/opportunity-intelligence', opportunityRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api', profileRoutes);
app.use('/api/demo-mode', demoRoutes);
app.use('/api/blanket-po', blanketPoRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/sentinel', sentinelRoutes);

app.use((err, _req, res, _next) => {
  if (err) {
    return res.status(500).json({ message: 'Unexpected server error', code: 'SERVER_ERROR' });
  }
  return res.status(500).json({ message: 'Unknown error' });
});

export default app;
