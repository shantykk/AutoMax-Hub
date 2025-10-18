import { getPool, sql } from '../config/db';
import { User } from '../models/User';

export const createUser = async (user: Omit<User, 'user_id'>): Promise<number> => {
  const pool = getPool();
  const request = new sql.Request(pool);
  const query = `
    INSERT INTO Users (username, full_name, email, phone_number, password, role)
    VALUES (@username, @full_name, @email, @phone_number, @password, @role);
    SELECT SCOPE_IDENTITY() AS user_id;
  `;
  request.input('username', sql.VarChar, user.username);
  request.input('full_name', sql.VarChar, user.full_name);
  request.input('email', sql.VarChar, user.email);
  request.input('phone_number', sql.VarChar, user.phone_number || null);
  request.input('password', sql.VarChar, user.password);
  request.input('role', sql.VarChar, user.role);
  try {
    const result = await request.query(query);
    return result.recordset[0].user_id;
  } catch (err: any) {
    throw new Error(`Error creating user: ${err.message}`);
  }
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const pool = getPool();
  const request = new sql.Request(pool);
  request.input('username', sql.VarChar, username);
  const query = `
    SELECT * FROM Users WHERE username = @username
  `;
  try {
    const result = await request.query(query);
    return result.recordset[0] || null;
  } catch (err: any) {
    throw new Error(`Error finding user by username: ${err.message}`);
  }
};

export const updateUserPassword = async (userId: number, hashedPassword: string): Promise<void> => {
  const pool = getPool();
  const request = new sql.Request(pool);
  request.input('user_id', sql.Int, userId);
  request.input('password', sql.VarChar, hashedPassword);
  const query = `
    UPDATE Users SET password = @password WHERE user_id = @user_id
  `;
  try {
    const result = await request.query(query);
    if (result.rowsAffected[0] === 0) {
      throw new Error('User not found');
    }
  } catch (err: any) {
    throw new Error(`Error updating user password: ${err.message}`);
  }
};