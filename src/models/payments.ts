export interface Payment {
  payment_id: number;
  trade_id: number;
  amount: number;
  payment_method: 'mpesa' | 'bank_transfer' | 'crypto';
  transaction_id?: string; // e.g., M-Pesa ID, bank transaction ID, or crypto hash
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
}