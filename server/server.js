import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(cors());
app.use(express.json());

const roleFilter = (req, _res, next) => { req.role = req.query.role || 'EXECUTIVE'; next(); };

async function aiSummarize(context) {
  if (!openai) return `AI fallback summary: ${context}`;
  const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: 'You are an industrial operations intelligence engine.' }, { role: 'user', content: context }] });
  return r.choices[0]?.message?.content || context;
}

app.get('/api/nexus/overview', roleFilter, async (req, res) => {
  const [suppliers, pos, jobs, alerts, rfqs] = await Promise.all([
    prisma.supplier.findMany(),
    prisma.purchaseOrder.findMany({ include: { supplier: true } }),
    prisma.manufacturingJob.findMany({ include: { purchaseOrders: { include: { po: true } } } }),
    prisma.operationalAlert.findMany({ orderBy: { createdAt: 'desc' }, include: { supplier: true, job: true, po: true } }),
    prisma.rFQ.findMany({ include: { supplier: true } })
  ]);
  res.json({ role: req.role, suppliers, purchaseOrders: pos, jobs, alerts, rfqs });
});

app.post('/api/nexus/workflows/supplier-escalation/:supplierId', async (req, res) => {
  const supplier = await prisma.supplier.update({ where: { id: req.params.supplierId }, data: { riskScore: { increment: 8 }, deliveryScore: { decrement: 5 }, escalationLevel: 'CRITICAL', status: 'ESCALATED' } });
  const summary = await aiSummarize(`Supplier ${supplier.supplierName} risk score is ${supplier.riskScore}. Generate impact + action in 2 sentences.`);
  const alert = await prisma.operationalAlert.create({ data: { severity: 'HIGH', alertType: 'SUPPLIER_RISK_ESCALATION', relatedSupplierId: supplier.id, aiSummary: summary, recommendedAction: 'Trigger alternate sourcing review and executive escalation.' } });
  res.json({ supplier, alert });
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'blackcrest-nexus', date: new Date().toISOString() }));

app.listen(process.env.PORT || 3000, () => console.log('Nexus server running'));
