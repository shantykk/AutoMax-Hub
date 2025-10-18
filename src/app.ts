// src/app.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';  // ✅ keep .js for runtime after TS build
import carsRouter from './routes/cars.js'; 

dotenv.config();
const app = express();
app.use(express.json());

// health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// register your routers (ensure these files exist)
app.use('/api/cars', carsRouter);

// global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await testConnection();
    app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start app due to DB connection error');
    process.exit(1);
  }
}

start();
