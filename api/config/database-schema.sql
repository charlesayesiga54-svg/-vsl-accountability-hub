-- VSLA Accountability System Database Schema

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('developer', 'secretary', 'member', 'admin');
CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'suspended', 'withdrawn');
CREATE TYPE loan_status AS ENUM ('applied', 'approved', 'rejected', 'active', 'repaid', 'defaulted');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'interest', 'fine', 'dividend');

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  group_id INTEGER,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  profile_photo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  password_changed_at TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups/VSLA Table
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  meeting_day VARCHAR(20),
  meeting_time TIME,
  financial_year_start MONTH,
  currency VARCHAR(3) DEFAULT 'UGX',
  interest_rate DECIMAL(5, 2) DEFAULT 10.0,
  fine_amount DECIMAL(10, 2) DEFAULT 5000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members Table
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  group_id INTEGER NOT NULL REFERENCES groups(id),
  national_id VARCHAR(50) UNIQUE,
  national_id_photo_url VARCHAR(500),
  date_of_birth DATE,
  gender VARCHAR(10),
  address VARCHAR(255),
  occupation VARCHAR(100),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  membership_date DATE NOT NULL DEFAULT CURRENT_DATE,
  membership_status membership_status DEFAULT 'active',
  share_capital DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Savings Table
CREATE TABLE savings (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  group_id INTEGER NOT NULL REFERENCES groups(id),
  savings_type VARCHAR(50) NOT NULL DEFAULT 'weekly',
  amount DECIMAL(15, 2) NOT NULL,
  opening_balance DECIMAL(15, 2),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by INTEGER REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans Table
CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  group_id INTEGER NOT NULL REFERENCES groups(id),
  amount DECIMAL(15, 2) NOT NULL,
  purpose VARCHAR(255),
  interest_rate DECIMAL(5, 2),
  duration_months INTEGER,
  guarantor1_id INTEGER REFERENCES members(id),
  guarantor2_id INTEGER REFERENCES members(id),
  status loan_status DEFAULT 'applied',
  approved_by INTEGER REFERENCES users(id),
  approval_date TIMESTAMP,
  disbursement_date TIMESTAMP,
  due_date DATE,
  outstanding_balance DECIMAL(15, 2),
  penalties_accumulated DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan Repayments Table
CREATE TABLE loan_repayments (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id),
  member_id INTEGER NOT NULL REFERENCES members(id),
  amount DECIMAL(15, 2) NOT NULL,
  interest_paid DECIMAL(15, 2) DEFAULT 0,
  penalties_paid DECIMAL(15, 2) DEFAULT 0,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by INTEGER REFERENCES users(id),
  receipt_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fines Table
CREATE TABLE fines (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  group_id INTEGER NOT NULL REFERENCES groups(id),
  reason VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  fine_date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid BOOLEAN DEFAULT false,
  paid_date DATE,
  recorded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meetings Table
CREATE TABLE meetings (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id),
  meeting_date TIMESTAMP NOT NULL,
  agenda TEXT,
  meeting_minutes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meeting Attendance Table
CREATE TABLE meeting_attendance (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES meetings(id),
  member_id INTEGER NOT NULL REFERENCES members(id),
  attended BOOLEAN DEFAULT false,
  contribution_amount DECIMAL(15, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Transactions Table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id),
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description VARCHAR(255),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by INTEGER REFERENCES users(id),
  reference_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id),
  document_type VARCHAR(100) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  notification_type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  read BOOLEAN DEFAULT false,
  sent_via VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better performance
CREATE INDEX idx_users_group_id ON users(group_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_members_group_id ON members(group_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_savings_member_id ON savings(member_id);
CREATE INDEX idx_savings_group_id ON savings(group_id);
CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_group_id ON loans(group_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loan_repayments_loan_id ON loan_repayments(loan_id);
CREATE INDEX idx_fines_member_id ON fines(member_id);
CREATE INDEX idx_meetings_group_id ON meetings(group_id);
CREATE INDEX idx_transactions_group_id ON transactions(group_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
