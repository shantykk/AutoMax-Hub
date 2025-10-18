import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, role } = req.body;
    if (!username || !password || !email || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!['Admin', 'Dealer', 'Client'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const userId = await registerUser({ username, password, email, role });
    res.status(201).json({ user_id: userId, message: 'User registered successfully' });
  } catch (err: any) {
    if (err.message === 'User already exists') {
      return res.status(409).json({ message: 'User already exists' });
    }
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing username or password' });
    }
    const { token, user } = await loginUser(username, password);
    res.json({ token, user_id: user.user_id, role: user.role });
  } catch (err: any) {
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};

// Optional: Password recovery - Forgot Password (sends reset token, e.g., via email - placeholder)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Missing email' });
    }
    // In full impl, generate reset token, save to DB, send email
    // For now, placeholder
    res.json({ message: 'Password reset link sent (placeholder)' });
  } catch (err: any) {
    res.status(500).json({ message: 'Error in password recovery', error: err.message });
  }
};

// Optional: Reset Password with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Missing token or new password' });
    }
    // In full impl, verify token, hash new password, update user
    res.json({ message: 'Password reset successfully (placeholder)' });
  } catch (err: any) {
    res.status(500).json({ message: 'Error resetting password', error: err.message });
  }
};