import { Car } from '../models/Car';
import { getAvailableCars, addCar, getCarById } from '../repositories/carRepository';

export const fetchAvailableCars = async (filters?: {
  model?: string;
  year?: number;
  fuel_type?: string;
}): Promise<Car[]> => {
  try {
    // Validate filters if provided
    if (filters?.year && (filters.year < 1900 || filters.year > new Date().getFullYear() + 1)) {
      throw new Error('Invalid year');
    }
    if (filters?.fuel_type && !['petrol', 'diesel', 'electric', 'hybrid'].includes(filters.fuel_type)) {
      throw new Error('Invalid fuel type');
    }

    // Fetch cars with optional filters
    return await getAvailableCars(filters);
  } catch (err: any) {
    throw new Error(`Error fetching cars: ${err.message}`);
  }
};

export const createCarListing = async (carData: Omit<Car, 'car_id'>, ownerId: number): Promise<number> => {
  try {
    // Validate input
    if (!carData.car_model || !carData.year_of_manufacture || !carData.engine_size || !carData.engine_number || !carData.fuel_capacity) {
      throw new Error('Missing required car fields');
    }
    if (carData.year_of_manufacture < 1900 || carData.year_of_manufacture > new Date().getFullYear() + 1) {
      throw new Error('Invalid year of manufacture');
    }
    if (carData.engine_size <= 0) {
      throw new Error('Invalid engine size');
    }
    if (carData.fuel_capacity <= 0) {
      throw new Error('Invalid fuel capacity');
    }

    // Set owner and default availability
    const car: Omit<Car, 'car_id'> = {
      ...carData,
      owner_id: ownerId,
      availability: true, // Default for new listings
    };

    return await addCar(car);
  } catch (err: any) {
    throw new Error(`Error creating car listing: ${err.message}`);
  }
};

export const getCarDetails = async (carId: number): Promise<Car> => {
  try {
    const car = await getCarById(carId);
    if (!car) {
      throw new Error('Car not found');
    }
    return car;
  } catch (err: any) {
    throw new Error(`Error fetching car details: ${err.message}`);
  }
};