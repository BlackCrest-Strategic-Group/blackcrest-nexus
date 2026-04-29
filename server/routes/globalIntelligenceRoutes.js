import { Router } from 'express';
import { buildGlobalIntelligenceOverview } from '../services/intelligence/intelligenceFusionService.js';

const router = Router();

router.get('/overview', (_req, res) => {
  try {
    return res.json(buildGlobalIntelligenceOverview());
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/country-risk', (_req, res) => {
  try {
    return res.json(buildGlobalIntelligenceOverview().countryRisks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/signals', (_req, res) => {
  try {
    return res.json(buildGlobalIntelligenceOverview().globalSignals);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
