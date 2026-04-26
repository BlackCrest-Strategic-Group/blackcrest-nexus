import { connectDB } from './backend/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import app from './server/app.js';
import { errorHandler, notFoundHandler } from './server/middleware/errorHandler.js';
import { seedRoleDemoUsers } from './server/services/demoUserService.js';
import { loadEnv } from './backend/utils/loadEnv.js';

loadEnv();


if (!process.env.MONGODB_URI && process.env.MONGO_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
}

if (process.env.MONGODB_URI) {
  try {
    await connectDB();
    await seedRoleDemoUsers();
  } catch (error) {
    console.warn(`Mongo connection unavailable: ${error.message}`);
  }
} else {
  console.warn('MONGODB_URI not set. API will run with limited persistence.');
}

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. AI intelligence features will run in fallback mode.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildCandidates = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'frontend', 'dist'),
  path.join(__dirname, 'frontend', 'web-build'),
  path.join(__dirname, 'frontend', 'build')
];
const frontendBuildPath = frontendBuildCandidates.find((candidate) =>
  fs.existsSync(path.join(candidate, 'index.html'))
) ?? path.join(__dirname, 'frontend', 'dist');

app.use(express.static(frontendBuildPath));
app.get('/', (_req, res) => res.sendFile(path.join(frontendBuildPath, 'index.html')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (path.extname(req.path)) return res.status(404).end();
  return res.sendFile(path.join(frontendBuildPath, 'index.html'));
});
app.use('/api', notFoundHandler);
app.use(errorHandler);

const PORT = Number.parseInt(process.env.PORT ?? '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`BlackCrest Procurement Intelligence Platform running on ${PORT}`);
  console.log(`Listening on http://${HOST}:${PORT}`);
  console.log(`Frontend build path: ${frontendBuildPath}`);
});
