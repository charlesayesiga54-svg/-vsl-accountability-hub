CREATE TYPE user_role AS ENUM ('developer', 'Secretary', 'Member');
CREATE TYPE member_status AS ENUM ('Active', 'Inactive');
CREATE TYPE loan_status AS ENUM ('Active', 'Fully Paid', 'Overdue');
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent', 'Excused');

CREATE TABLE developer_config (id SERIAL PRIMARY KEY, developer_password TEXT NOT NULL DEFAULT 'chaye1996', created_at TIMESTAMP DEFAULT NOW());
INSERT INTO developer_config (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE groups (id SERIAL PRIMARY KEY, group_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, allow_broadcast BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW());
INSERT INTO groups (group_id, name) VALUES ('GROUP-001', 'Village Savings Group 001') ON CONFLICT DO NOTHING;

CREATE TABLE members (id SERIAL PRIMARY KEY, group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE, membership_no TEXT NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL, role user_role DEFAULT 'Member', password_hash TEXT NOT NULL, status member_status DEFAULT 'Active', created_at TIMESTAMP DEFAULT NOW(), UNIQUE(group_id, membership_no));
INSERT INTO members (group_id, membership_no, name, phone, role, password_hash) VALUES (1, 'VSG-001', 'Group Secretary', '+254700000', 'Secretary', 'admin') ON CONFLICT DO NOTHING;

CREATE TABLE savings (id SERIAL PRIMARY KEY, group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE NOT NULL, member_id INTEGER REFERENCES members(id) ON DELETE CASCADE NOT NULL, amount DECIMAL(15,2) NOT NULL, transaction_date TEXT NOT NULL, recorded_by TEXT NOT NULL, notes TEXT, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE loans (id SERIAL PRIMARY KEY, group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE NOT NULL, member_id INTEGER REFERENCES members(id) ON DELETE CASCADE NOT NULL, principal DECIMAL(15,2) NOT NULL, interest_rate DECIMAL(5,2) DEFAULT 10.00, issue_date TEXT NOT NULL, due_date TEXT NOT NULL, status loan_status DEFAULT 'Active', recorded_by TEXT NOT NULL, notes TEXT, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE repayments (id SERIAL PRIMARY KEY, group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE NOT NULL, loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE NOT NULL, amount DECIMAL(15,2) NOT NULL, repayment_date TEXT NOT NULL, recorded_by TEXT NOT NULL, notes TEXT, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE attendance (id SERIAL PRIMARY KEY, group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE NOT NULL, member_id INTEGER REFERENCES members(id) ON DELETE CASCADE NOT NULL, meeting_date TEXT NOT NULL, status attendance_status DEFAULT 'Present', recorded_by TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW(), UNIQUE(group_id, member_id, meeting_date));
CREATE TABLE announcements (id SERIAL PRIMARY KEY, group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, meeting_date TEXT, recorded_by TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE audit_logs (id SERIAL PRIMARY KEY, group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE, member_id INTEGER REFERENCES members(id) ON DELETE SET NULL, action_type TEXT NOT NULL, description TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW());