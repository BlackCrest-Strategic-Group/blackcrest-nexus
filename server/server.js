import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/dashboard', (_req, res) => res.json({ spend: 12400000, activeRfqs: 38, onTimeDelivery: '94.2%' }));
app.get('/api/suppliers', (_req, res) => res.json([
  { id: 1, name: 'Atlas Components', category: 'Electronics', region: 'North America' },
  { id: 2, name: 'IronPeak Industrial', category: 'Machining', region: 'Europe' }
]));
app.post('/api/proposals', (req, res) => res.json({ ok: true, proposal: req.body, message: 'Proposal draft accepted in mock mode.' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));

app.listen(port, () => console.log(`Nexus server running on ${port}`));
