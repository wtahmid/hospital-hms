-- ============================================================
-- Hospital HMS — Database schema reference
-- SQLite is used via Flask-SQLAlchemy (see backend/app.py)
-- This file is a reference for the schema; the ORM creates it.
-- ============================================================

-- Users table (shared across all roles)
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','doctor','patient')),
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    created_at TEXT
);

-- Doctors
CREATE TABLE IF NOT EXISTS doctor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES user(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    specialization TEXT,
    phone TEXT,
    room_number TEXT,
    created_at TEXT
);

-- Patients
CREATE TABLE IF NOT EXISTS patient (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES user(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT,
    gender TEXT,
    phone TEXT,
    address TEXT,
    blood_group TEXT,
    created_at TEXT
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER REFERENCES patient(id) NOT NULL,
    doctor_id INTEGER REFERENCES doctor(id) NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled','confirmed','cancelled','completed')),
    notes TEXT,
    created_at TEXT
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescription (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER REFERENCES patient(id) NOT NULL,
    doctor_id INTEGER REFERENCES doctor(id) NOT NULL,
    appointment_id INTEGER REFERENCES appointment(id),
    diagnosis TEXT,
    medication TEXT,
    dosage TEXT,
    notes TEXT,
    created_at TEXT
);

-- Bills
CREATE TABLE IF NOT EXISTS bill (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER REFERENCES patient(id) NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid')),
    paid_at TEXT,
    created_at TEXT
);

-- ============================================================
-- Demo data (same as seed_database() in app.py)
-- Run these after the tables are created.
-- ============================================================

-- Admin
INSERT OR IGNORE INTO user (id, username, email, password_hash, role, first_name, last_name)
VALUES (1, 'admin', 'admin@hospital.com', 
        -- password: admin123
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYvDiKWFFpGYg5s1GMKVKFCL3JzDGJG'),
        'admin', 'System', 'Admin');

-- Doctors (5)
INSERT OR IGNORE INTO user (id, username, email, password_hash, role, first_name, last_name, phone)
VALUES 
(2, 'dr_sarah_chen', 'sarah@hospital.com', 
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYvDiKWFFpGYg5s1GMKVKFCL3JzDGJG', 'doctor', 'Sarah', 'Chen', '555-0101'),
(3, 'dr_michael_patel', 'michael@hospital.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYvDiKWFFpGYg5s1GMKVKFCL3JzDGJG', 'doctor', 'Michael', 'Patel', '555-0102'),
(4, 'dr_emily_rodriguez', 'emily@hospital.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYvDiKWFFpGYg5s1GMKVKFCL3JzDGJG', 'doctor', 'Emily', 'Rodriguez', '555-0103'),
(5, 'dr_james_wilson', 'james@hospital.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYvDiKWFFpGYg5s1GMKVKFCL3JzDGJG', 'doctor', 'James', 'Wilson', '555-0104'),
(6, 'dr_aisha_khan', 'aisha@hospital.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYvDiKWFFpGYg5s1GMKVKFCL3JzDGJG', 'doctor', 'Aisha', 'Khan', '555-0105');

INSERT OR IGNORE INTO doctor (id, user_id, first_name, last_name, specialization, phone, room_number) VALUES
(1, 2, 'Sarah', 'Chen', 'Cardiology', '555-0101', 'Room 201'),
(2, 3, 'Michael', 'Patel', 'Neurology', '555-0102', 'Room 202'),
(3, 4, 'Emily', 'Rodriguez', 'Pediatrics', '555-0103', 'Room 203'),
(4, 5, 'James', 'Wilson', 'Orthopedics', '555-0104', 'Room 204'),
(5, 6, 'Aisha', 'Khan', 'Dermatology', '555-0105', 'Room 205');

-- Patients (5)
INSERT OR IGNORE INTO user (id, username, email, password_hash, role, first_name, last_name, phone)
VALUES 
(7, 'patient_ra_j_mehta', 'raj.mehta@email.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYvDiKWFFpGYg5s1GMKVKFCL3JzDGJG', 'patient', 'Raj', 'Mehta', '9876543210'),
(8, 'patient_priya_sharma', 'priya.sharma@email.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYvDiKWFFpGYg5s1GMKVKFCL3JzDGJG', 'patient', 'Priya', 'Sharma', '9876543211'),
(9, 'patient_akash_singh', 'akash.singh@email.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYvDiKWFFpGYg5s1GMKVKFCL3JzDGJG', 'patient', 'Akash', 'Singh', '9876543212'),
(10, 'patient_meera_iyer', 'meera.iyer@email.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYvDiKWFFpGYg5s1GMKVKFCL3JzDGJG', 'patient', 'Meera', 'Iyer', '9876543213'),
(11, 'patient_vikram_joshi', 'vikram.joshi@email.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYvDiKWFFpGYg5s1GMKVKFCL3JzDGJG', 'patient', 'Vikram', 'Joshi', '9876543214');

INSERT OR IGNORE INTO patient (id, user_id, first_name, last_name, date_of_birth, gender, phone, address, blood_group) VALUES
(1, 7, 'Raj', 'Mehta', '1985-03-15', 'Male', '9876543210', '123 Main St, Mumbai', 'A+'),
(2, 8, 'Priya', 'Sharma', '1990-07-22', 'Female', '9876543211', '456 Park Ave, Delhi', 'B+'),
(3, 9, 'Akash', 'Singh', '1995-11-08', 'Male', '9876543212', '789 Lake Rd, Bangalore', 'O+'),
(4, 10, 'Meera', 'Iyer', '1988-04-30', 'Female', '9876543213', '321 Hill St, Chennai', 'AB+'),
(5, 11, 'Vikram', 'Joshi', '1978-09-12', 'Male', '9876543214', '555 River Rd, Kolkata', 'A-');

-- Appointments
INSERT OR IGNORE INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, status, notes) VALUES
(1, 1, date('now'), '09:00 AM', 'scheduled', 'Chest pain evaluation'),
(2, 2, date('now'), '10:30 AM', 'confirmed', 'Follow-up consultation'),
(3, 3, date('now','+1 day'), '11:00 AM', 'scheduled', 'Routine checkup'),
(4, 4, date('now','+2 day'), '09:30 AM', 'scheduled', 'Knee pain assessment'),
(5, 5, date('now','+1 day'), '02:00 PM', 'scheduled', 'Skin rash consultation');

-- Bills
INSERT OR IGNORE INTO bill (patient_id, amount, description, status) VALUES
(1, 2500.00, 'Cardiology consultation + ECG', 'pending'),
(2, 1500.00, 'Neurology follow-up consultation', 'pending'),
(4, 5000.00, 'MRI scan - Knee', 'pending');
