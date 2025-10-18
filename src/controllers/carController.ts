import { Request, Response } from 'express';
import { fetchAvailableCars, createCarListing } from '../services/carService';

export const getCars = async (req: Request, res: Response) => {
  try {
    const cars = await fetchAvailableCars();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cars' });
  }
};

export const postCar = async (req: Request, res: Response) => {
  try {
    const carId = await createCarListing(req.body, (req as any).user.user_id);
    res.status(201).json({ car_id: carId });
  } catch (err) {
    res.status(500).json({ message: 'Error adding car' });
  }
};