import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import multer from 'multer';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

const app = express();
const port = process.env.PORT || 3000;

let prisma = null;

try {
  prisma = new PrismaClient();
  console.log('Prisma initialized');
} catch (err) {
  console.error('Prisma initialization failed:', err);
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
const frontendDist = path.join(__dirname, '..', 'client', 'dist');

await fs.mkdir(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  },
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(frontendDist));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'blackcrest-nexus',
    openaiConfigured: Boolean(openai),
    prismaConfigured: Boolean(prisma),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'blackcrest-nexus-api',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/upload', upload.array('files', 20), (req, res) => {
  const files = (req.files || []).map((file) => ({
    fileName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    path: file.path,
  }));

  res.json({ ok: true, files });
});

app.get('/', async (_req, res) => {
  try {
    await fs.access(path.join(frontendDist, 'index.html'));
    return res.sendFile(path.join(frontendDist, 'index.html'));
  } catch (_error) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>BlackCrest Nexus</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            margin: 0;
            background: #000;
            color: white;
            font-family: Arial, sans-serif;
          }
          .hero {
            max-width: 1200px;
            margin: auto;
            padding: 100px 24px;
          }
          h1 {
            font-size: 64px;
            line-height: 1.1;
            margin-bottom: 24px;
          }
          p {
            color: #aaa;
            font-size: 22px;
            line-height: 1.6;
            max-width: 800px;
          }
          .btn {
            display: inline-block;
            margin-top: 40px;
            background: #fbbf24;
            color: black;
            padding: 18px 32px;
            border-radius: 14px;
            text-decoration: none;
            font-weight: bold;
          }
          .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit,minmax(240px,1fr));
            gap: 24px;
            margin-top: 80px;
          }
          .card {
            border: 1px solid #27272a;
            background: #111;
            padding: 24px;
            border-radius: 20px;
          }
          .card h3 {
            color: #fbbf24;
          }
        </style>
      </head>
      <body>
        <div class="hero">
          <div style="color:#fbbf24;font-weight:bold;margin-bottom:20px;">PROCUREMENT INTELLIGENCE OPERATING SYSTEM</div>
          <h1>Stop running procurement through spreadsheets.</h1>
          <p>
            BlackCrest Nexus delivers supplier intelligence, proposal analysis, sourcing visibility, operational alerts, and executive procurement command capabilities in one unified platform.
          </p>

          <a class="btn" href="/health">Platform Online</a>

          <div class="cards">
            <div class="card">
              <h3>Supplier Intelligence</h3>
              <p>Track supplier volatility, delays, and operational risk before production gets hit.</p>
            </div>

            <div class="card">
              <h3>Proposal Analysis</h3>
              <p>Upload RFQs, PDFs, spreadsheets, and sourcing packages for AI-assisted analysis.</p>
            </div>

            <div class="card">
              <h3>Executive Visibility</h3>
              <p>Surface procurement bottlenecks, sourcing delays, and operational blind spots instantly.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

app.get('*', async (req, res, next) => {
  try {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    await fs.access(path.join(frontendDist, 'index.html'));
    res.sendFile(path.join(frontendDist, 'index.html'));
  } catch (_error) {
    res.redirect('/');
  }
});

app.use((error, _req, res, _next) => {
  console.error('EXPRESS ERROR:', error);

  res.status(500).json({
    ok: false,
    error: error.message || 'Internal server error',
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`BlackCrest Nexus server running on port ${port}`);
});
