import express from 'express';
import multer from 'multer';
import { downloadProposalPdf, generateProposal, uploadProposal } from '../controllers/proposalController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/proposal/upload', upload.single('file'), uploadProposal);
router.post('/proposal/generate', generateProposal);
router.post('/proposal/pdf', downloadProposalPdf);

export default router;
