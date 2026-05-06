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

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

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

async function extractTextFromFile(filePath, mimeType) {
  if (mimeType.includes('pdf')) {
    const buffer = await fs.readFile(filePath);
    const parsed = await pdf(buffer);
    return parsed.text;
  }

  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    filePath.endsWith('.xlsx')
  ) {
    const workbook = XLSX.readFile(filePath);
    return workbook.SheetNames.map((name) =>
      XLSX.utils.sheet_to_csv(workbook.Sheets[name])
    ).join('\n');
  }

  if (mimeType.includes('word') || filePath.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  return await fs.readFile(filePath, 'utf8');
}

async function runAnalysisPrompt(documents) {
  if (!openai) {
    return {
      summary: 'OpenAI API key not configured.',
      supplierComparison: [],
      risks: ['AI analysis unavailable until OPENAI_API_KEY is configured.'],
      recommendation: 'Configure OpenAI integration.',
    };
  }

  const joined = documents
    .map((doc) => `FILE: ${doc.fileName}\n${doc.content.slice(0, 8000)}`)
    .join('\n\n');

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    messages: [
      {
        role: 'user',
        content: `Analyze procurement files and return JSON summary:\n\n${joined}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  return JSON.parse(response.choices[0].message.content);
}

app.post('/api/analyze', async (req, res, next) => {
  try {
    const { files = [] } = req.body;

    if (!files.length) {
      return res.status(400).json({
        ok: false,
        error: 'No files provided.',
      });
    }

    const documents = [];

    for (const file of files) {
      const content = await extractTextFromFile(file.path, file.mimeType || '');
      documents.push({ fileName: file.fileName, content });
    }

    const analysis = await runAnalysisPrompt(documents);

    res.json({
      ok: true,
      documentsProcessed: documents.length,
      analysis,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/nexus/overview', async (_req, res, next) => {
  try {
    const [suppliers, purchaseOrders, alerts] = await Promise.all([
      prisma.supplier.findMany().catch(() => []),
      prisma.purchaseOrder.findMany({
        include: { supplier: true },
      }).catch(() => []),
      prisma.operationalAlert.findMany({
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
    ]);

    res.json({
      suppliers,
      purchaseOrders,
      alerts,
    });
  } catch (error) {
    next(error);
  }
});

app.get('*', async (req, res, next) => {
  try {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    await fs.access(path.join(frontendDist, 'index.html'));
    res.sendFile(path.join(frontendDist, 'index.html'));
  } catch (error) {
    res.status(404).send('Frontend build not found.');
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);

  res.status(500).json({
    ok: false,
    error: error.message || 'Internal server error',
  });
});

app.listen(port, () => {
  console.log(`BlackCrest Nexus server running on port ${port}`);
});
