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
const frontendPath = path.join(__dirname, "../client/dist");

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
app.use(express.static(frontendPath));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "blackcrest-nexus"
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

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
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
