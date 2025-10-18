import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByUsername, updateUserPassword } from '../repositories/userRepository';
import { User } from '../models/User';

export const registerUser = async (userData: Omit<User, 'user_id'>): Promise<number> => {
  const { username, full_name, email, phone_number, password, role } = userData;

  // Validate required fields
  if (!username || !full_name || !email || !password || !role) {
    throw new Error('Missing required fields: username, full_name, email, password, role');
  }
  if (!['Admin', 'Dealer', 'Client'].includes(role)) {
    throw new Error('Invalid role. Must be Admin, Dealer, or Client');
  }

  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser: Omit<User, 'user_id'> = {
    username,
    full_name,
    email,
    phone_number,
    password: hashedPassword,
    role,
  };

  return createUser(newUser);
};

export const loginUser = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const user = await findUserByUsername(username);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { token, user };
};

export const resetUserPassword = async (userId: number, newPassword: string): Promise<void> => {
  if (!newPassword) {
    throw new Error('New password is required');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await updateUserPassword(userId, hashedPassword);
};