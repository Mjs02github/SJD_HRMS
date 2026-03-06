-- SJD_HRMS Database Schema
-- Run this file in your PostgreSQL database: psql -d sjd_hrms -f schema.sql

-- ============================================
-- 1. COMPANIES
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  logo_url    TEXT,
  pan         VARCHAR(20),
  gstin       VARCHAR(20),
  pf_reg_no   VARCHAR(50),
  esic_reg_no VARCHAR(50),
  address     TEXT,
  email       VARCHAR(100),
  phone       VARCHAR(20),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. DEPARTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
  id         SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. DESIGNATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS designations (
  id         SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL
);

-- ============================================
-- 4. USERS (HR / Admin / Manager logins)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(100) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  role         VARCHAR(30) DEFAULT 'hr' CHECK (role IN ('super_admin','hr','manager')),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Which companies can a user access
CREATE TABLE IF NOT EXISTS user_companies (
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, company_id)
);

-- ============================================
-- 5. EMPLOYEES
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id               SERIAL PRIMARY KEY,
  company_id       INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  emp_code         VARCHAR(30) NOT NULL,
  name             VARCHAR(150) NOT NULL,
  email            VARCHAR(100),
  phone            VARCHAR(20),
  dept_id          INT REFERENCES departments(id),
  designation_id   INT REFERENCES designations(id),
  manager_id       INT REFERENCES employees(id),
  doj              DATE,
  basic_salary     NUMERIC(12,2) DEFAULT 0,
  gross_salary     NUMERIC(12,2) DEFAULT 0,
  pf_applicable    BOOLEAN DEFAULT TRUE,
  esic_applicable  BOOLEAN DEFAULT TRUE,
  uan_no           VARCHAR(20),
  esic_no          VARCHAR(20),
  aadhar_no        VARCHAR(20),
  pan_no           VARCHAR(15),
  bank_account     VARCHAR(30),
  bank_ifsc        VARCHAR(15),
  bank_name        VARCHAR(100),
  profile_photo_url TEXT,
  status           VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','terminated')),
  created_at       TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, emp_code)
);

-- ============================================
-- 6. ATTENDANCE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id                   SERIAL PRIMARY KEY,
  employee_id          INT NOT NULL REFERENCES employees(id),
  company_id           INT NOT NULL REFERENCES companies(id),
  date                 DATE NOT NULL,
  check_in_time        TIMESTAMP,
  check_out_time       TIMESTAMP,
  check_in_selfie_url  TEXT,
  check_out_selfie_url TEXT,
  check_in_lat         NUMERIC(10,7),
  check_in_lng         NUMERIC(10,7),
  check_out_lat        NUMERIC(10,7),
  check_out_lng        NUMERIC(10,7),
  status               VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present','absent','half_day','wfh','holiday','leave')),
  remarks              TEXT,
  created_at           TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- ============================================
-- 7. GPS LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS gps_logs (
  id          SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(id),
  company_id  INT NOT NULL REFERENCES companies(id),
  lat         NUMERIC(10,7) NOT NULL,
  lng         NUMERIC(10,7) NOT NULL,
  accuracy    NUMERIC(6,2),
  battery_lvl INT,
  logged_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 8. LEAVES
-- ============================================
CREATE TABLE IF NOT EXISTS leaves (
  id          SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(id),
  company_id  INT NOT NULL REFERENCES companies(id),
  type        VARCHAR(30) DEFAULT 'casual' CHECK (type IN ('casual','sick','earned','unpaid','other')),
  from_date   DATE NOT NULL,
  to_date     DATE NOT NULL,
  reason      TEXT,
  status      VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by INT REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 9. ADVANCE PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS advance_payments (
  id               SERIAL PRIMARY KEY,
  employee_id      INT NOT NULL REFERENCES employees(id),
  company_id       INT NOT NULL REFERENCES companies(id),
  amount           NUMERIC(12,2) NOT NULL,
  recovered_amount NUMERIC(12,2) DEFAULT 0,
  date             DATE NOT NULL,
  reason           TEXT,
  deduction_mode   VARCHAR(20) DEFAULT 'full' CHECK (deduction_mode IN ('full','partial')),
  monthly_deduction NUMERIC(12,2),
  status           VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','partial','recovered')),
  created_by       INT REFERENCES users(id),
  created_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 10. PAYROLL
-- ============================================
CREATE TABLE IF NOT EXISTS payroll (
  id                SERIAL PRIMARY KEY,
  employee_id       INT NOT NULL REFERENCES employees(id),
  company_id        INT NOT NULL REFERENCES companies(id),
  month             INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year              INT NOT NULL,
  basic             NUMERIC(12,2) DEFAULT 0,
  hra               NUMERIC(12,2) DEFAULT 0,
  allowances        NUMERIC(12,2) DEFAULT 0,
  gross_salary      NUMERIC(12,2) DEFAULT 0,
  working_days      INT DEFAULT 26,
  present_days      NUMERIC(5,2) DEFAULT 0,
  lop_days          NUMERIC(5,2) DEFAULT 0,
  lop_deduction     NUMERIC(12,2) DEFAULT 0,
  pf_employee       NUMERIC(12,2) DEFAULT 0,
  pf_employer       NUMERIC(12,2) DEFAULT 0,
  esic_employee     NUMERIC(12,2) DEFAULT 0,
  esic_employer     NUMERIC(12,2) DEFAULT 0,
  advance_deduction NUMERIC(12,2) DEFAULT 0,
  other_deductions  NUMERIC(12,2) DEFAULT 0,
  net_salary        NUMERIC(12,2) DEFAULT 0,
  payslip_url       TEXT,
  email_sent        BOOLEAN DEFAULT FALSE,
  status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  paid_at           TIMESTAMP,
  created_at        TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- ============================================
-- 11. PF RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS pf_records (
  id           SERIAL PRIMARY KEY,
  employee_id  INT NOT NULL REFERENCES employees(id),
  company_id   INT NOT NULL REFERENCES companies(id),
  month        INT NOT NULL,
  year         INT NOT NULL,
  uan_no       VARCHAR(20),
  epf_wages    NUMERIC(12,2) DEFAULT 0,
  eps_wages    NUMERIC(12,2) DEFAULT 0,
  epf_contri   NUMERIC(12,2) DEFAULT 0,
  eps_contri   NUMERIC(12,2) DEFAULT 0,
  ncp_days     INT DEFAULT 0,
  refund_adv   NUMERIC(12,2) DEFAULT 0,
  created_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- ============================================
-- 12. ESIC RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS esic_records (
  id              SERIAL PRIMARY KEY,
  employee_id     INT NOT NULL REFERENCES employees(id),
  company_id      INT NOT NULL REFERENCES companies(id),
  month           INT NOT NULL,
  year            INT NOT NULL,
  gross_wages     NUMERIC(12,2) DEFAULT 0,
  employee_contri NUMERIC(12,2) DEFAULT 0,
  employer_contri NUMERIC(12,2) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- ============================================
-- 13. HR SETTINGS (per company)
-- ============================================
CREATE TABLE IF NOT EXISTS hr_settings (
  id         SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  key        VARCHAR(100) NOT NULL,
  value      TEXT,
  UNIQUE(company_id, key)
);

-- Default: send_payslip_email = false
-- INSERT INTO hr_settings(company_id, key, value) VALUES (1, 'send_payslip_email', 'false');

-- ============================================
-- Default Super Admin (change password after first login!)
-- Password: Admin@123 (bcrypt hash)
-- ============================================
-- INSERT INTO users(name, email, password, role) 
-- VALUES ('Super Admin', 'admin@sjdhrms.com', '$2a$10$...hash...', 'super_admin');
