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

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 400 }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/category-intelligence', categoryRoutes);
app.use('/api/supplier-intelligence', supplierRoutes);
app.use('/api/opportunity-intelligence', opportunityRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api', profileRoutes);

app.use((err, _req, res, _next) => {
  if (err) {
    return res.status(500).json({ message: 'Unexpected server error', code: 'SERVER_ERROR' });
  }
  return res.status(500).json({ message: 'Unknown error' });
});

export default app;
