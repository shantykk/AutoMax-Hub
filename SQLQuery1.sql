-- Drop tables if they exist to avoid conflicts
IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL DROP TABLE dbo.Payments;
IF OBJECT_ID('dbo.Trades', 'U') IS NOT NULL DROP TABLE dbo.Trades;
IF OBJECT_ID('dbo.Cars', 'U') IS NOT NULL DROP TABLE dbo.Cars;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- Create Users table (added full_name, phone_number for realism)
CREATE TABLE dbo.Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    username VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),  -- e.g., '+254123456789'
    password VARCHAR(255) NOT NULL,  -- Hashed
    role VARCHAR(20) NOT NULL,  -- 'Admin', 'Dealer', 'Client'
    CONSTRAINT CHK_Role CHECK (role IN ('Admin', 'Dealer', 'Client')),
    CONSTRAINT UQ_Username UNIQUE (username),
    CONSTRAINT UQ_Email UNIQUE (email)
);
GO

-- Create Cars table (using DECIMAL for precision)
CREATE TABLE dbo.Cars (
    car_id INT PRIMARY KEY IDENTITY(1,1),
    car_model VARCHAR(100) NOT NULL,
    year_of_manufacture INT NOT NULL,
    engine_size DECIMAL(3,1) NOT NULL,  -- e.g., 2.5
    engine_number VARCHAR(50) NOT NULL,
    availability BIT NOT NULL,
    extra_modifications VARCHAR(MAX),
    fuel_capacity DECIMAL(5,1) NOT NULL,  -- e.g., 60.0
    owner_id INT NOT NULL,
    fuel_type VARCHAR(20),
    CONSTRAINT CHK_Year CHECK (year_of_manufacture BETWEEN 1900 AND YEAR(GETDATE()) + 1),
    CONSTRAINT CHK_Engine_Size CHECK (engine_size >= 0),
    CONSTRAINT CHK_Fuel_Capacity CHECK (fuel_capacity >= 0),
    CONSTRAINT UQ_Engine_Number UNIQUE (engine_number),
    FOREIGN KEY (owner_id) REFERENCES dbo.Users(user_id)
);
GO

-- Create Trades table
CREATE TABLE dbo.Trades (
    trade_id INT PRIMARY KEY IDENTITY(1,1),
    proposer_car_id INT NOT NULL,
    target_car_id INT NOT NULL,
    proposer_user_id INT NOT NULL,
    target_user_id INT NOT NULL,
    cash_top_up DECIMAL(10,2) DEFAULT 0,  -- e.g., 5000.00
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_Status CHECK (status IN ('pending', 'approved', 'rejected')),
    FOREIGN KEY (proposer_car_id) REFERENCES dbo.Cars(car_id),
    FOREIGN KEY (target_car_id) REFERENCES dbo.Cars(car_id),
    FOREIGN KEY (proposer_user_id) REFERENCES dbo.Users(user_id),
    FOREIGN KEY (target_user_id) REFERENCES dbo.Users(user_id)
);
GO

-- Create Payments table (added transaction_id, updated payment_method)
CREATE TABLE dbo.Payments (
    payment_id INT PRIMARY KEY IDENTITY(1,1),
    trade_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,  -- e.g., 5000.00
    payment_method VARCHAR(50) NOT NULL, -- 'mpesa', 'bank_transfer', 'crypto'
    transaction_id VARCHAR(50),  -- e.g., M-Pesa transaction ID or crypto hash
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_Payment_Method CHECK (payment_method IN ('mpesa', 'bank_transfer', 'crypto')),
    CONSTRAINT CHK_Amount CHECK (amount > 0),
    CONSTRAINT UQ_Transaction_Id UNIQUE (transaction_id),
    FOREIGN KEY (trade_id) REFERENCES dbo.Trades(trade_id)
);
GO

-- Insert sample users (enhanced with full_name, phone_number)
INSERT INTO dbo.Users (username, full_name, email, phone_number, password, role)
VALUES 
    ('admin1', 'John Mwangi', 'admin1@example.com', '+254700123456', '$2y$10$BIf5OSAak9o3zGnpm6wzXOaED8b3tPS51OVGPwu6aBzwr4zlW9hYC', 'Admin'),
    ('dealer1', 'Mary Wanjiku', 'dealer1@example.com', '+254711987654', '$2y$10$dQWt8EXkM/ejeXru.oZW8ulOhiolWyuzSHAlg95A4Cl/dY1r881PS', 'Dealer'),
    ('client1', 'Peter Kamau', 'client1@example.com', '+254722345678', '$2y$10$9MRXlrAd.EihbnOKGRd0VOcSscr7gfCsk7gj0et7dBw1QsLPokb52', 'Client'),
    ('client2', 'Susan Njeri', 'client2@example.com', '+254733456789', '$2y$10$hPXsnXv8u.1GrWXVSP5F4OBeLIxyM6nRcUzDCNAXXo6dPJHxOB3wm', 'Client'),
    ('client3', 'James Otieno', 'client3@example.com', '+254744567890', '$2y$10$63/BdOmBJihmomlGAZqnpOUuYFpu3NQ7HLndtL2e60Lo7IEflmyWm', 'Client');
GO

-- Insert five example cars
INSERT INTO dbo.Cars (car_model, year_of_manufacture, engine_size, engine_number, availability, extra_modifications, fuel_capacity, owner_id, fuel_type)
VALUES 
    ('Toyota Camry', 2020, 2.5, 'ENG123456', 1, 'Sunroof, Leather Seats', 60.0, 3, 'petrol'),
    ('Honda Civic', 2019, 2.0, 'ENG789012', 1, 'Sport Kit, Tinted Windows', 50.0, 3, 'petrol'),
    ('Tesla Model 3', 2022, 0.0, 'ENG345678', 1, 'Autopilot, Premium Audio', 0.0, 4, 'electric'),
    ('Ford Mustang', 2021, 5.0, 'ENG901234', 1, 'Performance Package', 61.0, 4, 'petrol'),
    ('BMW X5', 2020, 3.0, 'ENG567890', 1, 'M Sport Package', 85.0, 5, 'diesel');
GO

-- Insert sample trades (to support Payments)
INSERT INTO dbo.Trades (proposer_car_id, target_car_id, proposer_user_id, target_user_id, cash_top_up, status, created_at)
VALUES 
    (1, 3, 3, 4, 5000.00, 'approved', '2025-10-18 10:00:00'), -- Client1 (Peter) trades Toyota Camry for Tesla
    (2, 4, 3, 4, 3000.00, 'pending', '2025-10-18 11:00:00'), -- Client1 (Peter) proposes Honda Civic for Mustang
    (5, 1, 5, 3, 10000.00, 'approved', '2025-10-18 12:00:00'); -- Client3 (James) trades BMW X5 for Camry
GO

-- Insert sample payments (with mpesa, bank_transfer, crypto)
INSERT INTO dbo.Payments (trade_id, amount, payment_method, transaction_id, status, created_at)
VALUES 
    (1, 5000.00, 'mpesa', 'MPESA123456789', 'completed', '2025-10-18 10:30:00'), -- Payment for trade 1
    (3, 10000.00, 'bank_transfer', 'BANK987654321', 'completed', '2025-10-18 12:30:00'), -- Payment for trade 3
    (1, 2000.00, 'crypto', '0xabcdef1234567890', 'pending', '2025-10-18 11:00:00'); -- Partial payment for trade 1
GO