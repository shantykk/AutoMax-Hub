import { sql } from '../config/db.js';
import { Car } from '../models/Car';

export const getAvailableCars = async (filters?: {
  model?: string;
  year?: number;
  fuel_type?: string;
}): Promise<Car[]> => {
  let query = `SELECT * FROM Cars WHERE availability = 1`;
  const request = new sql.Request();

  if (filters?.model) {
    query += ` AND car_model LIKE @model`;
    request.input('model', sql.VarChar, `%${filters.model}%`);
  }
  if (filters?.year) {
    query += ` AND year_of_manufacture = @year`;
    request.input('year', sql.Int, filters.year);
  }
  if (filters?.fuel_type) {
    query += ` AND fuel_type = @fuel_type`;
    request.input('fuel_type', sql.VarChar, filters.fuel_type);
  }

  try {
    const result = await request.query(query);
    return result.recordset;
  } catch (err: any) {
    throw new Error(`Error fetching available cars: ${err.message}`);
  }
};

export const addCar = async (car: Omit<Car, 'car_id'>): Promise<number> => {
  const request = new sql.Request();
  const query = `
    INSERT INTO Cars (car_model, year_of_manufacture, engine_size, engine_number, availability, extra_modifications, fuel_capacity, owner_id, fuel_type)
    VALUES (@car_model, @year_of_manufacture, @engine_size, @engine_number, @availability, @extra_modifications, @fuel_capacity, @owner_id, @fuel_type);
    SELECT SCOPE_IDENTITY() AS car_id;
  `;

  try {
    request.input('car_model', sql.VarChar, car.car_model);
    request.input('year_of_manufacture', sql.Int, car.year_of_manufacture);
    request.input('engine_size', sql.Float, car.engine_size);
    request.input('engine_number', sql.VarChar, car.engine_number);
    request.input('availability', sql.Bit, car.availability);
    request.input('extra_modifications', sql.Text, car.extra_modifications || null);
    request.input('fuel_capacity', sql.Float, car.fuel_capacity);
    request.input('owner_id', sql.Int, car.owner_id);
    request.input('fuel_type', sql.VarChar, car.fuel_type || null);

    const result = await request.query(query);
    return result.recordset[0].car_id;
  } catch (err: any) {
    throw new Error(`Error adding car: ${err.message}`);
  }
};

export const getCarById = async (carId: number): Promise<Car | null> => {
  const request = new sql.Request();
  request.input('car_id', sql.Int, carId);
  const query = `SELECT * FROM Cars WHERE car_id = @car_id`;

  try {
    const result = await request.query(query);
    return result.recordset[0] || null;
  } catch (err: any) {
    throw new Error(`Error fetching car by ID: ${err.message}`);
  }
};

export const updateCar = async (carId: number, updates: Partial<Car>): Promise<void> => {
  const request = new sql.Request();
  let query = `UPDATE Cars SET `;
  const fields: string[] = [];
  
  if (updates.owner_id !== undefined) {
    fields.push(`owner_id = @owner_id`);
    request.input('owner_id', sql.Int, updates.owner_id);
  }
  if (updates.availability !== undefined) {
    fields.push(`availability = @availability`);
    request.input('availability', sql.Bit, updates.availability);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  query += fields.join(', ') + ` WHERE car_id = @car_id`;
  request.input('car_id', sql.Int, carId);

  try {
    await request.query(query);
  } catch (err: any) {
    throw new Error(`Error updating car: ${err.message}`);
  }
};