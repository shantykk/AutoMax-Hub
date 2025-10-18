import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { user_id: number; role: string };
    (req as any).user = { user_id: decoded.user_id, role: decoded.role } as User;
    next();
  } catch (err: any) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user as User;

  if (!user || user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};