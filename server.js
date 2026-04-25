import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './backend/config/db.js';
import express from 'express';
import app from './server/app.js';
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
const frontendDistPath = path.join(__dirname, 'frontend', 'dist');

app.use(express.static(frontendDistPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  return res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const PORT = Number.parseInt(process.env.PORT ?? '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`BlackCrest Procurement Intelligence Platform running on ${PORT}`);
  console.log(`Listening on http://${HOST}:${PORT}`);
});
