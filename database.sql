
CREATE DATABASE IF NOT EXISTS placement_system;
USE placement_system;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    branch VARCHAR(50) NOT NULL,
    cgpa DECIMAL(4,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    package_lpa DECIMAL(6,2),
    location VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    company_id INT NOT NULL,
    status VARCHAR(30) DEFAULT 'Applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    UNIQUE (student_id, company_id)
);