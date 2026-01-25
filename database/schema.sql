CREATE SCHEMA IF NOT EXISTS vehicle_service;

-- 1. CUSTOMER
CREATE TABLE IF NOT EXISTS customers(
    customer_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. VEHICLE
CREATE TABLE IF NOT EXISTS vehicles(
    vehicle_id INT PRIMARY KEY,
    plate_no VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(30) NOT NULL,
    customer_id INT REFERENCES customers(customer_id)
);

-- 3. SERVICE REQUEST
CREATE TABLE IF NOT EXISTS service_requests(
    request_id INT PRIMARY KEY,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    service_type VARCHAR(30) NOT NULL,
    problem_note TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'Normal',
    vehicle_id INT REFERENCES vehicles(vehicle_id)
);

-- 4. SERVICE JOB
CREATE TABLE IF NOT EXISTS service_jobs(
    job_id INT PRIMARY KEY,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    labor_charge NUMERIC(10,2),
    job_status VARCHAR(20) NOT NULL DEFAULT 'In Progress',
    request_id INT REFERENCES service_requests(request_id)
);

-- 5. INVENTORY
CREATE TABLE IF NOT EXISTS inventory(
    part_id INT PRIMARY KEY,
    part_name VARCHAR(100) NOT NULL,
    part_code VARCHAR(50) UNIQUE NOT NULL,
    brand VARCHAR(50) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity_in_stock INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL,
    description TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. JOB PARTS USED
CREATE TABLE IF NOT EXISTS job_parts_used(
    job_part_id INT PRIMARY KEY,
    quantity_used INT NOT NULL,
    unit_price_at_time NUMERIC(10,2) NOT NULL,
    job_id INT REFERENCES service_jobs(job_id),
    part_id INT REFERENCES inventory(part_id)
);

-- 7. BILLING
CREATE TABLE IF NOT EXISTS billing(
    bill_id INT PRIMARY KEY,
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal_labor NUMERIC(10,2) NOT NULL,
    subtotal_parts NUMERIC(10,2) NOT NULL,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Unpaid',
    job_id INT REFERENCES service_jobs(job_id)
);
