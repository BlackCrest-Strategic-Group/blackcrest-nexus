import express from 'express';

const router = express.Router();

router.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    service: 'Global Source Exchange API',
    modules: [
      'supplier-intelligence',
      'rfq-marketplace',
      'category-management',
      'procurement-analytics'
    ]
  });
});

router.get('/categories', async (req, res) => {
  res.json([
    'MRO',
    'Office Supplies',
    'Facilities',
    'Packaging',
    'IT Hardware',
    'Logistics',
    'Professional Services'
  ]);
});

router.get('/insights', async (req, res) => {
  res.json({
    activeRfqs: 284,
    verifiedSuppliers: 12480,
    aiRecommendations: 1204,
    procurementAlerts: [
      'Supplier consolidation opportunity detected',
      'Lead time increase in electronics category',
      'Indirect spend leakage identified'
    ]
  });
});

export default router;
