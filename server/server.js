const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const procurementRoutes = require('./routes/procurement');
const sourcingRoutes = require('./routes/sourcing');
const marketplaceRoutes = require('./routes/marketplace');
const proposalRoutes = require('./routes/proposal');
const purchasingRoutes = require('./routes/purchasing');
const categoryRoutes = require('./routes/category');
const fundingRoutes = require('./routes/funding');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blackcrest-nexus';

mongoose.connect(MONGO_URI).then(() => console.log('MongoDB connected')).catch((err) => console.error('MongoDB connection error:', err.message));

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/sourcing', sourcingRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/proposal', proposalRoutes);
app.use('/api/purchasing', purchasingRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/funding', fundingRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
