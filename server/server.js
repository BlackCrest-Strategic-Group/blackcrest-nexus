import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import app from './app.js';

dotenv.config();

const port = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../client/dist');

process.on('uncaughtException', (error) => {
  console.error('[bootstrap] uncaught exception', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[bootstrap] unhandled rejection', reason);
});

app.use((error, _req, res, _next) => {
  console.error('[express] unhandled error', error);
  res.status(error?.status || 500).json({
    ok: false,
    message: error?.message || 'Unexpected server error'
  });
});

app.use(express.static(frontendDistPath));

app.use((_req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`BlackCrest Nexus API running on :${port}`);
});
