import CategorySnapshot from '../models/CategorySnapshot.js';
import SupplierProfile from '../models/SupplierProfile.js';
import OpportunityAnalysis from '../models/OpportunityAnalysis.js';
import ActionItem from '../models/ActionItem.js';
import { buildCategoryOutput, buildOpportunityOutput } from './analysisService.js';

export async function seedDemoData(userId, tenantId) {
  const hasSeed = await CategorySnapshot.exists({ userId, tenantId });
  if (hasSeed) return;

  const category = await CategorySnapshot.create({
    tenantId,
    userId,
    categoryName: 'IT Hardware',
    product: 'Secure Laptops',
    geography: 'United States',
    notes: 'Q3 refresh cycle',
    output: buildCategoryOutput({ categoryName: 'IT Hardware', product: 'Secure Laptops', geography: 'United States' })
  });

  const suppliers = await SupplierProfile.insertMany([
    {
      userId,
      tenantId,
      name: 'Summit Tech Supply',
      category: 'IT Hardware',
      location: 'Virginia, USA',
      capabilities: ['Secure endpoint provisioning', 'Fed procurement support'],
      tags: ['incumbent', 'high-capability'],
      risks: ['Capacity constraints during surge'],
      relationshipScore: 82
    },
    {
      userId,
      tenantId,
      name: 'Apex Devices Group',
      category: 'IT Hardware',
      location: 'Texas, USA',
      capabilities: ['Rapid fulfillment', 'Lifecycle services'],
      tags: ['challenger'],
      relationshipScore: 71
    }
  ]);

  await OpportunityAnalysis.create({
    tenantId,
    userId,
    title: 'Agency Endpoint Modernization RFP',
    linkedCategorySnapshotId: category._id,
    linkedSupplierIds: suppliers.map((s) => s._id),
    output: buildOpportunityOutput({ title: 'Agency Endpoint Modernization RFP' })
  });

  await ActionItem.insertMany([
    { tenantId, userId, title: 'Review IT Hardware risk posture', sourceType: 'category', priority: 'high' },
    { tenantId, userId, title: 'Evaluate Apex Devices as secondary supplier', sourceType: 'supplier', priority: 'medium' }
  ]);
}
