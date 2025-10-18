import { Trade, payment } from '../models/trade';
import { createTrade, getTradeById, updateTradeStatus, getMostTradedModels } from '../repositories/traderepository';
import { getCarById } from '../repositories/carRepository';
import { findUserById } from '../repositories/userRepository';

export const proposeTrade = async (tradeData: Omit<Trade, 'trade_id' | 'status' | 'created_at'>): Promise<number> => {
  const { proposer_car_id, target_car_id, proposer_user_id, cash_top_up } = tradeData;

  // Validate cars
  const proposerCar = await getCarById(proposer_car_id);
  const targetCar = await getCarById(target_car_id);
  if (!proposerCar || !targetCar) {
    throw new Error('Invalid car ID');
  }
  if (!proposerCar.availability || !targetCar.availability) {
    throw new Error('One or both cars are not available');
  }
  if (proposerCar.owner_id !== proposer_user_id) {
    throw new Error('You do not own the proposer car');
  }

  // Get target user
  const target_user_id = targetCar.owner_id;
  if (proposer_user_id === target_user_id) {
    throw new Error('Cannot trade with yourself');
  }

  const trade = { proposer_car_id, target_car_id, proposer_user_id, target_user_id, cash_top_up, status: 'pending', created_at: new Date() };
  return createTrade(trade);
};

export const approveTrade = async (tradeId: number, status: 'approved' | 'rejected', user: { user_id: number; role: string }): Promise<void> => {
  const trade = await getTradeById(tradeId);
  if (!trade) {
    throw new Error('Invalid trade ID');
  }
  if (user.role !== 'Admin' && user.user_id !== trade.target_user_id) {
    throw new Error('Unauthorized to approve/reject this trade');
  }
  if (trade.status !== 'pending') {
    throw new Error('Trade is not pending');
  }

  await updateTradeStatus(tradeId, status);
  if (status === 'approved') {
    // Update car ownership (simplified - in full impl, swap owner_id and set availability=false)
    await updateCarOwnership(trade.proposer_car_id, trade.target_user_id);
    await updateCarOwnership(trade.target_car_id, trade.proposer_user_id);
  }
};

export const recordPayment = async (paymentData: { trade_id: number; amount: number; payment_method: string; user_id: number }): Promise<number> => {
  const trade = await getTradeById(paymentData.trade_id);
  if (!trade) {
    throw new Error('Invalid trade ID');
  }
  if (trade.status !== 'approved') {
    throw new Error('Trade not approved');
  }
  if (paymentData.user_id !== trade.proposer_user_id && paymentData.user_id !== trade.target_user_id) {
    throw new Error('Unauthorized to make payment');
  }
  if (paymentData.amount !== trade.cash_top_up) {
    throw new Error('Payment amount does not match trade cash top-up');
  }

  const payment = {
    trade_id: paymentData.trade_id,
    amount: paymentData.amount,
    payment_method: paymentData.payment_method,
    status: 'completed', // Simplified - in full impl, verify payment
    created_at: new Date(),
  };
  return createPayment(payment);
};

export const generateTradeAnalytics = async (type?: string): Promise<any> => {
  if (type === 'most_traded_models') {
    return getMostTradedModels();
  }
  // Add more report types (client_activity, cash_flow) as needed
  return { message: 'Default analytics - implement other types' };
};

// Helper to update car ownership (add to carRepository.ts)
export const updateCarOwnership = async (carId: number, newOwnerId: number): Promise<void> => {
  await updateCar(carId, { owner_id: newOwnerId, availability: false });
};