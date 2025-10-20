import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './config/db';
import authRoutes from './routes/authRoutes';
import carRoutes from './routes/carRoutes';
import tradeRoutes from './routes/tradeRoutes';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/trades', tradeRoutes);

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err: any) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();