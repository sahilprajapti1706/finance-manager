-- Finance Dashboard — Database Schema
-- All statements use IF NOT EXISTS / DO $$ so this file is safe to re-run.
-- Executed automatically by src/db/bootstrap.ts on server startup.

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role   AS ENUM ('viewer', 'analyst', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE record_type AS ENUM ('income', 'expense');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── FUNCTIONS ─────────────────────────────────────────────────────────────

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ─── TABLES ─────────────────────────────────────────────────────────────────

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for users updated_at
DO $$ BEGIN
    CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Financial Records Table
CREATE TABLE IF NOT EXISTS financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    type record_type NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for financial_records updated_at
DO $$ BEGIN
    CREATE TRIGGER trigger_financial_records_updated_at
    BEFORE UPDATE ON financial_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Refresh Tokens Table (for JWT rotation)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    related_record_id UUID REFERENCES financial_records(id) ON DELETE SET NULL
);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Additional index for faster lookup of records by user and date
CREATE INDEX IF NOT EXISTS idx_records_created_by ON financial_records(created_by);
CREATE INDEX IF NOT EXISTS idx_records_date ON financial_records(date);
CREATE INDEX IF NOT EXISTS idx_records_type ON financial_records(type);
CREATE INDEX IF NOT EXISTS idx_records_is_deleted ON financial_records(is_deleted);

-- ─── SEED DATA ──────────────────────────────────────────────────────────────
-- Password for all accounts: password123

DO $$ 
DECLARE 
    admin_id UUID;
    analyst_id UUID;
    viewer_id UUID;
    pass_hash TEXT := '$2b$10$CnO00jBZUtjzgPWQakGee.f05VddzUTcqC4PcMU04TfYkxGSH4qpm';
BEGIN
    -- 1. Create Users
    INSERT INTO users (name, email, password_hash, role)
    VALUES ('Admin User', 'admin@example.com', pass_hash, 'admin')
    ON CONFLICT (email) DO UPDATE SET 
        name = EXCLUDED.name, 
        role = EXCLUDED.role,
        password_hash = EXCLUDED.password_hash -- Ensure login always works with seed pass
    RETURNING id INTO admin_id;

    INSERT INTO users (name, email, password_hash, role)
    VALUES ('Analyst User', 'analyst@example.com', pass_hash, 'analyst')
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash
    RETURNING id INTO analyst_id;

    INSERT INTO users (name, email, password_hash, role)
    VALUES ('Viewer User', 'viewer@example.com', pass_hash, 'viewer')
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash
    RETURNING id INTO viewer_id;

    -- 2. Create Financial Records (Force Refresh for new categories)
    -- We delete first to ensure the 'old' categories are replaced by the 'new' dropdown-compatible ones.
    DELETE FROM financial_records;

    -- 2. Create Financial Records (High Density for Wavy Curves)
    DELETE FROM financial_records;

    -- Helper loop for 12 months of data
    FOR i IN 0..11 LOOP
        -- INCOMES (Varying Salary + Freelance)
        INSERT INTO financial_records (created_by, amount, type, category, date, notes) VALUES
        (admin_id, (120000 + (RANDOM() * 60000)), 'income', 'Salary', CURRENT_DATE - (i || ' months')::INTERVAL, 'Monthly Salary'),
        (analyst_id, (5000 + (RANDOM() * 25000)), 'income', 'Investments', CURRENT_DATE - (i || ' months')::INTERVAL - INTERVAL '15 days', 'Dividends & Returns');

        IF i % 2 = 0 THEN
            INSERT INTO financial_records (created_by, amount, type, category, date, notes) VALUES
            (viewer_id, (10000 + (RANDOM() * 30000)), 'income', 'Freelance', CURRENT_DATE - (i || ' months')::INTERVAL - INTERVAL '22 days', 'Project Bonus');
        END IF;

        -- EXPENSES (Wavy patterns)
        INSERT INTO financial_records (created_by, amount, type, category, date, notes) VALUES
        (admin_id, 45000, 'expense', 'Rent', CURRENT_DATE - (i || ' months')::INTERVAL - INTERVAL '1 day', 'Apt Rent'),
        (analyst_id, (4000 + (RANDOM() * 4000)), 'expense', 'Groceries', CURRENT_DATE - (i || ' months')::INTERVAL - INTERVAL '5 days', 'Monthly Groceries'),
        (admin_id, (2000 + (RANDOM() * 8000)), 'expense', 'Utilities', CURRENT_DATE - (i || ' months')::INTERVAL - INTERVAL '10 days', 'Bills'),
        (viewer_id, (5000 + (RANDOM() * 35000)), 'expense', 'Travel', CURRENT_DATE - (i || ' months')::INTERVAL - INTERVAL '12 days', 'Travel & Commute'),
        (admin_id, (2000 + (RANDOM() * 15000)), 'expense', 'Dining Out', CURRENT_DATE - (i || ' months')::INTERVAL - INTERVAL '18 days', 'Restaurant visit'),
        (analyst_id, (1000 + (RANDOM() * 5000)), 'expense', 'Entertainment', CURRENT_DATE - (i || ' months')::INTERVAL - INTERVAL '25 days', 'Movie & Games');

        -- Occasional big expenses
        IF i % 3 = 0 THEN
            INSERT INTO financial_records (created_by, amount, type, category, date, notes) VALUES
            (admin_id, (20000 + (RANDOM() * 40000)), 'expense', 'Healthcare', CURRENT_DATE - (i || ' months')::INTERVAL - INTERVAL '8 days', 'Medical Checkup/Procedure');
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅  Dense financial records (12 Months) inserted for wavy visualization.';

    -- 3. Sample Notifications for Admin
    IF (SELECT COUNT(*) FROM notifications) = 0 THEN
       INSERT INTO notifications (user_id, message, type)
       VALUES (admin_id, 'Welcome to your premium Finance Dashboard! Explore your trends and categories.', 'info');
    END IF;

END $$;
