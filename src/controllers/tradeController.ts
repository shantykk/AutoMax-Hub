import { Request, Response, NextFunction } from 'express';
import { proposetrade, approvetrade, recordPayment, generateTradeAnalytics } from '../services/tradeService';
import { authenticate, isAdmin } from '../middleware/authmiddleware';
import { getCarById } from '../repositories/carRepository';

interface AuthRequest extends Request {
  user?: { user_id: number; role: string };
}

export const proposetrade = async (req: AuthRequest, res: Response) => {
  try {
    const { my_car_id, target_car_id, cash_top_up } = req.body;
    const proposer_user_id = req.user?.user_id;

    if (!proposer_user_id) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }
    if (!my_car_id || !target_car_id) {
      return res.status(400).json({ message: 'Missing car IDs' });
    }
    if (cash_top_up && cash_top_up < 0) {
      return res.status(400).json({ message: 'Cash top-up cannot be negative' });
    }

    // Fetch target car's owner to get target_user_id
    const targetCar = await getCarById(target_car_id);
    if (!targetCar) {
      return res.status(400).json({ message: 'Target car not found' });
    }

    const tradeId = await proposetrade({
      proposer_car_id: my_car_id,
      target_car_id,
      proposer_user_id,
      target_user_id: targetCar.owner_id,
      cash_top_up: cash_top_up || 0,
    });

    res.status(201).json({ trade_id: tradeId, message: 'Trade proposed successfully' });
  } catch (err: any) {
    if (err.message.includes('Invalid') || err.message.includes('Unauthorized')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error proposing trade', error: err.message });
  }
};

export const approveTrade = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use "approved" or "rejected"' });
    }

    await approveTrade(parseInt(id), status, user);
    res.json({ trade_id: id, message: `Trade ${status}` });
  } catch (err: any) {
    if (err.message.includes('Invalid') || err.message.includes('Unauthorized')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error processing trade', error: err.message });
  }
};

export const recordpayment = async (req: AuthRequest, res: Response) => {
  try {
    const { trade_id, amount, payment_method, transaction_id } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }
    if (!trade_id || !amount || !payment_method) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }
    if (!['mpesa', 'bank_transfer', 'crypto'].includes(payment_method)) {
      return res.status(400).json({ message: 'Invalid payment method. Use "mpesa", "bank_transfer", or "crypto"' });
    }

    const paymentId = await recordPayment({ trade_id, amount, payment_method, transaction_id, user_id });
    res.status(201).json({ payment_id: paymentId, message: 'Payment recorded' });
  } catch (err: any) {
    if (err.message.includes('Invalid') || err.message.includes('Unauthorized')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error recording payment', error: err.message });
  }
};

export const getTradeAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const validTypes = ['most_traded_models', 'client_activity', 'cash_flow'];
    if (type && !validTypes.includes(type as string)) {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    const report = await generateTradeAnalytics(type as string | undefined);
    res.json({ report });
  } catch (err: any) {
    res.status(500).json({ message: 'Error generating analytics', error: err.message });
  }
};