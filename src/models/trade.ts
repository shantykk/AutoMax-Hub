export interface Trade {
  trade_id: number;
  proposer_car_id: number;
  target_car_id: number;
  proposer_user_id: number;
  target_user_id: number;
  cash_top_up: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
}