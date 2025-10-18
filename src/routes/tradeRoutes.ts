import express from 'express';
import { proposetrade, approvetrade, recordpayment, getTradeAnalytics } from '../controllers/tradeController';
import { authenticate, isAdmin } from '../middleware/authmiddleware';

const router = express.Router();

router.post('/propose', authenticate, proposetrade);
router.patch('/approve/:id', authenticate, approvetrade);
router.post('/payments', authenticate, recordpayment);
router.get('/reports', authenticate, isAdmin, getTradeAnalytics);

export default router;