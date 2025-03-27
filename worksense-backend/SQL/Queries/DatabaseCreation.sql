CREATE DATABASE CRDigital;
GO

USE CRDigital;
GO

CREATE TABLE test (
    text VARCHAR(255) NOT NULL
);

CREATE TABLE projects (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Pending'
);

INSERT INTO projects (name, description, status)
VALUES 
('E-Commerce Platform', 'Development of an online shopping platform.', 'In Progress'),

('Mobile Banking App', 'A secure banking application for mobile users.', 'Planned'),

('Smart Traffic System', 'An AI-based system to optimize city traffic.', 'In Progress'),

('Cybersecurity Audit', 'A complete security audit for a financial institution.', 'Planned'),

('Healthcare Management System', 'A web-based system for managing hospital records.', 'Completed');
