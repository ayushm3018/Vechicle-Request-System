-- Vehicle Requisition Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS vehicle_requisition_db;
USE vehicle_requisition_db;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    role ENUM('employee', 'admin') DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    make_model VARCHAR(255) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vehicle requests table
CREATE TABLE vehicle_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    officer_name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    required_date DATE NOT NULL,
    required_time TIME NOT NULL,
    report_place TEXT NOT NULL,
    places_to_visit TEXT NOT NULL,
    journey_purpose TEXT NOT NULL,
    release_time TIME NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Approved requests table
CREATE TABLE approved_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    approved_by INT NOT NULL,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES vehicle_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data

-- Sample admin user (password: admin123)
INSERT INTO users (name, email, password, designation, role) VALUES 
('Admin User', 'admin@company.com', '$2a$10$rOzJEUq1J1J5C4N8L4.GYerCQ3.QJ5q3.8kH.c9TbG9.G6d5P0M.K', 'System Administrator', 'admin');

-- Sample employee user (password: employee123)
INSERT INTO users (name, email, password, designation, role) VALUES 
('John Doe', 'john.doe@company.com', '$2a$10$J1J5C4N8L4.GYerCQ3.QJ5q3.8kH.c9TbG9.G6d5P0M.KrOzJEUq1', 'Senior Manager', 'employee');

-- Sample vehicles
INSERT INTO vehicles (vehicle_number, make_model, driver_name, is_available) VALUES
('KA-01-1234', 'Toyota Innova Crysta', 'Ravi Kumar', true),
('KA-01-5678', 'Maruti Swift Dzire', 'Suresh Sharma', true),
('KA-01-9012', 'Hyundai Creta', 'Amit Singh', true),
('DL-02-3456', 'Mahindra Scorpio', 'Rajesh Gupta', true),
('MH-12-7890', 'Honda City', 'Prakash Yadav', false);

-- Sample vehicle requests
INSERT INTO vehicle_requests (employee_id, officer_name, designation, required_date, required_time, report_place, places_to_visit, journey_purpose, release_time, status) VALUES
(2, 'John Doe', 'Senior Manager', '2024-01-15', '09:00:00', 'Main Office, Bangalore', 'Client Office, Electronic City', 'Business meeting with client', '17:00:00', 'pending'),
(2, 'John Doe', 'Senior Manager', '2024-01-20', '14:00:00', 'Main Office, Bangalore', 'Airport, Conference Hall', 'Airport pickup and conference attendance', '20:00:00', 'approved');

-- Sample approved request
INSERT INTO approved_requests (request_id, vehicle_id, approved_by) VALUES
(2, 1, 1);