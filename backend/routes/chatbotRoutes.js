import express from 'express';
import { chatWithAI, getSystemInsights, generateReport, checkDrugInteractions } from '../controllers/chatbotController.js';

const router = express.Router();

// Chat with AI
router.post('/chat', chatWithAI);

// Check drug interactions
router.post('/drug-interactions', checkDrugInteractions);

// Get system insights
router.get('/insights', getSystemInsights);

// Generate reports
router.post('/reports', generateReport);

export default router; 