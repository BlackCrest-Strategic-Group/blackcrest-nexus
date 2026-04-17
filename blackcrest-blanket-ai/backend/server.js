const express = require('express');
const cors = require('cors');
const uploadRoute = require('./routes/upload');
const { pluginRegistry } = require('./plugins');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'blackcrest-blanket-ai-backend' });
});

app.post('/erp/:provider/export', (req, res) => {
  const provider = req.params.provider?.toLowerCase();
  const plugin = pluginRegistry[provider];

  if (!plugin) {
    return res.status(400).json({
      message: `Unsupported ERP provider: ${provider}`,
      supportedProviders: Object.keys(pluginRegistry)
    });
  }

  const mappedPayload = plugin.mapBlanketRecommendations(req.body.blanketRecommendations || []);
  return res.json({ message: 'ERP payload generated', payload: mappedPayload });
});

app.use('/upload', uploadRoute);

app.use((err, _req, res, _next) => {
  res.status(500).json({ message: 'Unexpected backend error', error: err.message });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`BlackCrest Blanket AI backend listening on port ${PORT}`);
});
