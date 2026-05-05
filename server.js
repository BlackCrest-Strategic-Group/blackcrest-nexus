import path from 'path';
import express from 'express';

const app = express();
const __dirname = new URL('.', import.meta.url).pathname;

if (!process.env.SAM_API_KEY) {
  console.warn('Missing SAM_API_KEY');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/sam', async (req, res) => {
  try {
    if (!process.env.SAM_API_KEY) {
      return res.json({ data: [], error: 'Missing API key' });
    }

    return res.json({ data: [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
