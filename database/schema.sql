-- ============================================================
-- Staff Leave Management System — Database Schema
-- Compatible with: Microsoft SQL Server & Azure SQL Database
-- ============================================================

-- Step 1: Create the database (run this separately in SSMS or Azure portal)
-- CREATE DATABASE StaffLeaveDB;
-- GO
-- USE StaffLeaveDB;
-- GO

-- ============================================================
-- TABLE: users
--
-- Stores both employees and admins in one table.
-- The 'role' column differentiates them.
--
-- Relationships:
--   users.id  ←  leave_requests.employee_id  (one user → many leaves)
--   users.id  ←  leave_requests.reviewed_by  (one admin → many reviews)
-- ============================================================
CREATE TABLE users (
    id          INT             IDENTITY(1,1)   PRIMARY KEY,    -- Auto-increment PK
    name        NVARCHAR(100)   NOT NULL,
    email       NVARCHAR(150)   NOT NULL        UNIQUE,          -- Enforces unique emails at DB level
    password    NVARCHAR(255)   NOT NULL,                        -- bcrypt hash (never plain text)
    role        NVARCHAR(20)    NOT NULL        DEFAULT 'employee'
                                CONSTRAINT CHK_user_role CHECK (role IN ('employee', 'admin')),
    department  NVARCHAR(100)   NULL,
    created_at  DATETIME2       DEFAULT GETDATE()
);
GO

-- ============================================================
-- TABLE: leave_requests
--
-- Each row is one leave application from an employee.
--
-- Foreign keys:
--   employee_id → users.id   (which employee applied)
--   reviewed_by → users.id   (which admin approved/rejected)
--
-- ON DELETE CASCADE on employee_id:
--   Automatically removes leave records if the employee is deleted.
-- ============================================================
CREATE TABLE leave_requests (
    id               INT             IDENTITY(1,1)   PRIMARY KEY,
    employee_id      INT             NOT NULL,
    leave_type       NVARCHAR(50)    NOT NULL
                     CONSTRAINT CHK_leave_type CHECK (
                         leave_type IN ('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other')
                     ),
    start_date       DATE            NOT NULL,
    end_date         DATE            NOT NULL,
    reason           NVARCHAR(500)   NOT NULL,
    status           NVARCHAR(20)    NOT NULL        DEFAULT 'pending'
                     CONSTRAINT CHK_leave_status CHECK (
                         status IN ('pending', 'approved', 'rejected', 'cancelled')
                     ),
    rejection_reason NVARCHAR(300)   NULL,           -- Populated when admin rejects
    reviewed_by      INT             NULL,           -- FK: admin who reviewed
    reviewed_at      DATETIME2       NULL,
    created_at       DATETIME2       DEFAULT GETDATE(),

    -- FK 1: tie to the employee who applied
    CONSTRAINT FK_leave_employee
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,

    -- FK 2: tie to the admin who reviewed (no cascade — keep audit trail)
    CONSTRAINT FK_leave_reviewer
        FOREIGN KEY (reviewed_by) REFERENCES users(id),

    -- Prevent end_date < start_date at the database level
    CONSTRAINT CHK_valid_dates
        CHECK (end_date >= start_date)
);
GO

-- ============================================================
-- INDEXES
-- Speed up common queries (filter by employee, filter by status)
-- ============================================================
CREATE INDEX IX_leave_employee_id ON leave_requests(employee_id);
CREATE INDEX IX_leave_status      ON leave_requests(status);
GO

-- ============================================================
-- SEED: Default admin account
--
-- Email   : admin@company.com
-- Password: Admin@1234
--
-- The hash below was generated with bcrypt.hash('Admin@1234', 10).
-- IMPORTANT: Change this password immediately after first login,
--            or generate a fresh hash:
--   node -e "const b=require('bcryptjs'); b.hash('YourPassword',10).then(console.log)"
-- ============================================================
INSERT INTO users (name, email, password, role, department)
VALUES (
    'System Admin',
    'admin@company.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'admin',
    'Administration'
);
GO

-- ============================================================
-- SAMPLE employee (optional — for testing)
-- Password: Admin@1234  (same hash as admin — change after seeding)
-- ============================================================
INSERT INTO users (name, email, password, role, department)
VALUES (
    'Jane Smith',
    'jane@company.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'employee',
    'Engineering'
);
GO
