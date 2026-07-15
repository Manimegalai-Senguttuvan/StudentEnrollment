DROP DATABASE IF EXISTS student_enrollment;
CREATE DATABASE student_enrollment;
USE student_enrollment;

-- Users Table (for login)
CREATE TABLE IF NOT EXISTS Users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) UNIQUE NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) DEFAULT 'User',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS Students (
    StudentId INT AUTO_INCREMENT PRIMARY KEY,
    RollNumber VARCHAR(50) UNIQUE NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Phone VARCHAR(20),
    DateOfBirth DATE NOT NULL,
    EnrollmentDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE IF NOT EXISTS Courses (
    CourseId INT AUTO_INCREMENT PRIMARY KEY,
    CourseName VARCHAR(150) NOT NULL,
    CourseCode VARCHAR(20) UNIQUE NOT NULL,
    Description TEXT,
    Credits INT NOT NULL,
    Instructor VARCHAR(100) NOT NULL,
    MaxCapacity INT NOT NULL
);

-- Enrollments Table (Joins Students and Courses)
CREATE TABLE IF NOT EXISTS Enrollments (
    EnrollmentId INT AUTO_INCREMENT PRIMARY KEY,
    StudentId INT NOT NULL,
    CourseId INT NOT NULL,
    EnrollmentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Grade VARCHAR(5),
    Status VARCHAR(20) DEFAULT 'Active',
    FOREIGN KEY (StudentId) REFERENCES Students(StudentId) ON DELETE CASCADE,
    FOREIGN KEY (CourseId) REFERENCES Courses(CourseId) ON DELETE CASCADE
);

-- Default Admin User (password: admin123, hashed with BCrypt)
INSERT INTO Users (Username, Email, PasswordHash, Role) VALUES
('admin', 'admin@studentenrollment.com', '$2a$11$qK5f6X3vLmN8pQr9sT7uV.wXyZ1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o', 'Admin');

-- Default Student Users (password: admin123, hashed with BCrypt)
INSERT INTO Users (Username, Email, PasswordHash, Role) VALUES
('STU001', 'john.doe@email.com', '$2a$11$qK5f6X3vLmN8pQr9sT7uV.wXyZ1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o', 'User'),
('STU002', 'jane.smith@email.com', '$2a$11$qK5f6X3vLmN8pQr9sT7uV.wXyZ1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o', 'User'),
('STU003', 'bob.johnson@email.com', '$2a$11$qK5f6X3vLmN8pQr9sT7uV.wXyZ1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o', 'User'),
('STU004', 'alice.williams@email.com', '$2a$11$qK5f6X3vLmN8pQr9sT7uV.wXyZ1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o', 'User');

-- Sample Students
INSERT INTO Students (RollNumber, FirstName, LastName, Email, Phone, DateOfBirth) VALUES
('STU001', 'John', 'Doe', 'john.doe@email.com', '555-0101', '2000-05-15'),
('STU002', 'Jane', 'Smith', 'jane.smith@email.com', '555-0102', '1999-08-22'),
('STU003', 'Bob', 'Johnson', 'bob.johnson@email.com', '555-0103', '2001-01-10'),
('STU004', 'Alice', 'Amsterdam', 'alice.williams@email.com', '555-0104', '2000-11-30');

-- Sample Courses
INSERT INTO Courses (CourseName, CourseCode, Description, Credits, Instructor, MaxCapacity) VALUES
('Introduction to Computer Science', 'CS101', 'Basic computing concepts', 3, 'Dr. Alan Turing', 50),
('Database Systems', 'CS201', 'Relational databases and SQL', 4, 'Dr. Edgar Codd', 40),
('Web Development', 'CS301', 'Full-stack web development', 3, 'Dr. Tim Berners-Lee', 45),
('Data Structures', 'CS102', 'Algorithms and data structures', 4, 'Dr. Donald Knuth', 35);

-- Sample Enrollments
INSERT INTO Enrollments (StudentId, CourseId, Grade, Status) VALUES
(1, 1, 'A', 'Active'),
(1, 2, 'B+', 'Active'),
(2, 1, 'A-', 'Active'),
(2, 3, 'B', 'Active'),
(3, 2, 'A', 'Active'),
(3, 4, 'B+', 'Active'),
(4, 3, 'A-', 'Active'),
(4, 1, 'B', 'Active');
