import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.operationalAlert.deleteMany();
  await prisma.jobPO.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.manufacturingJob.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  const users = await prisma.$transaction([
    prisma.user.create({ data: { name: 'Maya Buyer', role: 'BUYER', facility: 'Houston', permissions: ['po:read', 'rfq:write'] } }),
    prisma.user.create({ data: { name: 'Leo Ops', role: 'OPERATIONS', facility: 'Phoenix', permissions: ['job:read', 'alert:manage'] } }),
    prisma.user.create({ data: { name: 'Evelyn Exec', role: 'EXECUTIVE', facility: 'Global HQ', permissions: ['kpi:read'] } })
  ]);

  const s1 = await prisma.supplier.create({ data: { supplierName: 'Titan Fasteners', category: 'Fasteners', region: 'US', leadTimeAverage: 19, deliveryScore: 79, riskScore: 74, escalationLevel: 'HIGH', status: 'AT_RISK' } });
  const s2 = await prisma.supplier.create({ data: { supplierName: 'NorthForge Metals', category: 'Alloys', region: 'CA', leadTimeAverage: 14, deliveryScore: 91, riskScore: 33, escalationLevel: 'LOW', status: 'ACTIVE' } });

  const po1 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-88421', supplierId: s1.id, material: 'A286 Bolts', quantity: 5000, dueDate: new Date('2026-05-16'), status: 'LATE_RISK', cost: 42800, riskFlag: true } });
  const po2 = await prisma.purchaseOrder.create({ data: { poNumber: 'PO-88477', supplierId: s2.id, material: 'Titanium Sheet', quantity: 220, dueDate: new Date('2026-05-21'), status: 'IN_TRANSIT', cost: 97200 } });

  const job = await prisma.manufacturingJob.create({ data: { jobNumber: 'JOB-22019', productionPhase: 'Assembly', materialStatus: 'SHORTAGE', blockedReason: 'A286 fastener backorder', completionPercent: 61 } });
  await prisma.jobPO.create({ data: { jobId: job.id, poId: po1.id } });
  await prisma.jobPO.create({ data: { jobId: job.id, poId: po2.id } });

  await prisma.rFQ.createMany({ data: [
    { rfqNumber: 'RFQ-6611', item: 'Heat-treated fastener kit', requestedQty: 8000, dueDate: new Date('2026-05-12'), supplierId: s1.id, estimatedCost: 56000, status: 'OPEN' },
    { rfqNumber: 'RFQ-6612', item: 'Alternative A286 kit', requestedQty: 8000, dueDate: new Date('2026-05-12'), supplierId: s2.id, estimatedCost: 58800, status: 'BID_REVIEW' }
  ]});

  await prisma.operationalAlert.create({ data: { severity: 'CRITICAL', alertType: 'SUPPLIER_RISK_ESCALATION', relatedSupplierId: s1.id, relatedJobId: job.id, relatedPoId: po1.id, aiSummary: 'Supplier delivery trends indicate instability for critical fasteners. Assembly throughput is exposed within 72 hours.', recommendedAction: 'Shift 40% of fastener volume to NorthForge and expedite air freight.', assignedUserId: users[0].id } });
}

main().finally(() => prisma.$disconnect());
