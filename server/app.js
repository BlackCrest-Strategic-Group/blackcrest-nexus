import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
import governanceRoutes from './routes/governanceRoutes.js';
import procurementOsRoutes from './routes/procurementOsRoutes.js';
import procurementIntelligenceRoutes from './routes/procurementIntelligenceRoutes.js';
import procurementLiveRoutes from './routes/procurementLiveRoutes.js';
import globalIntelligenceRoutes from './routes/globalIntelligenceRoutes.js';
import { cleanRoomCompliance } from '../middleware/cleanRoomCompliance.js';
import { auditTrail } from './middleware/auditTrail.js';
import { requestContext } from './middleware/requestContext.js';
import { requestLogger } from './middleware/requestLogger.js';
import { sanitizeApiInput } from './middleware/apiSanitization.js';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimiter.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({
  limit: '5mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(requestContext);
app.use(requestLogger);
app.use('/api', sanitizeApiInput);
app.use('/api', apiRateLimiter);
app.use('/api', cleanRoomCompliance);
app.use(auditTrail);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/category-intelligence', categoryRoutes);
app.use('/api/supplier-intelligence', supplierRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/opportunity-intelligence', opportunityRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api', profileRoutes);
app.use('/api/demo-mode', demoRoutes);
app.use('/api/blanket-po', blanketPoRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/sentinel', sentinelRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api', procurementOsRoutes);
app.use('/api/procurement-intelligence', procurementIntelligenceRoutes);
app.use('/api/procurement-live', procurementLiveRoutes);
app.use('/api/global-intelligence', globalIntelligenceRoutes);

export default app;
