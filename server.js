import express from 'express';import cors from 'cors';import helmet from 'helmet';import rateLimit from 'express-rate-limit';import compression from 'compression';import dotenv from 'dotenv';import mongoose from 'mongoose';import path from 'path';import {fileURLToPath} from 'url';
import auth from './backend/routes/auth.js';import opportunities from './backend/routes/opportunities.js';import marketplace from './backend/routes/marketplace.js';import billing from './backend/routes/billing.js';import funding from './backend/routes/funding.js';import analytics from './backend/routes/analytics.js';import sentinel from './backend/routes/sentinel.js';
dotenv.config(); const app=express(); const __dirname=path.dirname(fileURLToPath(import.meta.url)); const frontendPath=path.join(__dirname,'frontend','dist'); app.use(cors({origin:process.env.CLIENT_URL||'*'}));app.use(helmet());app.use(rateLimit({windowMs:60000,max:120}));app.use(compression());app.use(express.json());
mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost:27017/blackcrest').catch(()=>{});
app.get('/api/health',(_req,res)=>res.json({status:'ok',service:'blackcrest-nexus'}));
app.use('/api/auth',auth);app.use('/api/opportunities',opportunities);app.use('/api/marketplace',marketplace);app.use('/api/billing',billing);app.use('/api/funding-lead',funding);app.use('/api/analytics',analytics);app.use('/api/sentinel',sentinel);
app.use(express.static(frontendPath));app.get('*',(_req,res)=>res.sendFile(path.join(frontendPath,'index.html')));
app.listen(process.env.PORT||5000,()=>console.log('api running'));
