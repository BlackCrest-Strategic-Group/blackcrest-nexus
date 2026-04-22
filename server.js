import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './backend/config/db.js';
import express from 'express';
import app from './server/app.js';
import { seedRoleDemoUsers } from './server/services/demoUserService.js';

dotenv.config();

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, 'frontend', 'dist');

app.use(express.static(frontendDistPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  return res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BlackCrest Procurement Intelligence Platform running on ${PORT}`);
});

