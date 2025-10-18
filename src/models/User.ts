export interface User {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  phone_number?: string; // Optional, e.g., '+254722345678'
  password: string; // Hashed
  role: 'Admin' | 'Dealer' | 'Client';
}