import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import uploadRoutes from './routes/upload.js';
import statusRoutes from './routes/status.js';

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blackcrest_mvp';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI).then(() => console.log('Mongo connected')).catch((err) => console.error(err.message));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/status', statusRoutes);

const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  return res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => console.log(`BlackCrest MVP running on ${PORT}`));
