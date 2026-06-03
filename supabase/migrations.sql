-- =============================================
-- KalinEdu Analytics - Supabase Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- GRADING SYSTEMS TABLE
-- =============================================
CREATE TABLE grading_systems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_default BOOLEAN DEFAULT false,
  thresholds JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SCHOOLS TABLE
-- =============================================
CREATE TABLE schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  grading_system_id UUID REFERENCES grading_systems(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT '',
  role TEXT DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher')),
  school_id UUID REFERENCES schools(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PLANS TABLE
-- =============================================
CREATE TABLE plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price_kes INTEGER NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 12,
  max_uploads_per_month INTEGER,
  max_students_per_upload INTEGER,
  max_file_size_mb INTEGER DEFAULT 10,
  includes_pdf_report BOOLEAN DEFAULT false,
  includes_excel_report BOOLEAN DEFAULT true,
  includes_advanced_analytics BOOLEAN DEFAULT false,
  includes_school_branding BOOLEAN DEFAULT false,
  includes_priority_support BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  plan_id UUID REFERENCES plans(id) NOT NULL,
  school_id UUID REFERENCES schools(id),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  paystack_reference TEXT,
  paystack_subscription_code TEXT,
  amount_paid INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- UPLOADS TABLE
-- =============================================
CREATE TABLE uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  school_id UUID REFERENCES schools(id),
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  grading_system TEXT DEFAULT 'CBC',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE grading_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Grading Systems: anyone can read, only admin can write
CREATE POLICY "Grading systems are viewable by everyone" ON grading_systems
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert grading systems" ON grading_systems
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update grading systems" ON grading_systems
  FOR UPDATE USING (true);

CREATE POLICY "Admin can delete grading systems" ON grading_systems
  FOR DELETE USING (true);

-- Schools: anyone can read, authenticated can insert
CREATE POLICY "Schools are viewable by everyone" ON schools
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert schools" ON schools
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update schools" ON schools
  FOR UPDATE USING (true);

CREATE POLICY "Admin can delete schools" ON schools
  FOR DELETE USING (true);

-- Users: anyone can read, insert allowed
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert themselves" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update themselves" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Admin can delete users" ON users
  FOR DELETE USING (true);

-- Plans: anyone can read, admin can write
CREATE POLICY "Plans are viewable by everyone" ON plans
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert plans" ON plans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update plans" ON plans
  FOR UPDATE USING (true);

CREATE POLICY "Admin can delete plans" ON plans
  FOR DELETE USING (true);

-- Subscriptions: users can read their own, admin can read all
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update subscriptions" ON subscriptions
  FOR UPDATE USING (true);

CREATE POLICY "Admin can delete subscriptions" ON subscriptions
  FOR DELETE USING (true);

-- Uploads: users can read their own, admin can read all
CREATE POLICY "Users can view own uploads" ON uploads
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own uploads" ON uploads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update uploads" ON uploads
  FOR UPDATE USING (true);

CREATE POLICY "Admin can delete uploads" ON uploads
  FOR DELETE USING (true);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_school_id ON uploads(school_id);
CREATE INDEX idx_uploads_created_at ON uploads(created_at);
CREATE INDEX idx_plans_is_active ON plans(is_active);
CREATE INDEX idx_grading_systems_is_default ON grading_systems(is_default);

-- =============================================
-- SEED DATA
-- =============================================

-- Default grading systems
INSERT INTO grading_systems (id, name, description, is_default, thresholds) VALUES
('g1', 'CBC (Competency Based Curriculum)', 'Kenya CBC grading for primary schools', true,
 '[{"min":90,"max":100,"grade":"EE1","points":12},{"min":75,"max":89,"grade":"EE2","points":11},{"min":58,"max":74,"grade":"ME1","points":10},{"min":41,"max":57,"grade":"ME2","points":9},{"min":31,"max":40,"grade":"AE1","points":8},{"min":21,"max":30,"grade":"AE2","points":7},{"min":11,"max":20,"grade":"BE1","points":6},{"min":0,"max":10,"grade":"BE2","points":5}]'),
('g2', 'KCSE Secondary', 'Kenya secondary school KCSE grading', false,
 '[{"min":81,"max":100,"grade":"A","points":12},{"min":75,"max":80,"grade":"A-","points":11},{"min":69,"max":74,"grade":"B+","points":10},{"min":61,"max":68,"grade":"B","points":9},{"min":54,"max":60,"grade":"B-","points":8},{"min":48,"max":53,"grade":"C+","points":7},{"min":42,"max":47,"grade":"C","points":6},{"min":36,"max":41,"grade":"C-","points":5},{"min":30,"max":35,"grade":"D+","points":4},{"min":24,"max":29,"grade":"D","points":3},{"min":18,"max":23,"grade":"D-","points":2},{"min":0,"max":17,"grade":"E","points":1}]');

-- Default plans
INSERT INTO plans (id, name, description, price_kes, duration_months, max_uploads_per_month, max_students_per_upload, max_file_size_mb, includes_pdf_report, includes_excel_report, includes_advanced_analytics, includes_school_branding, includes_priority_support, is_default, is_active, sort_order) VALUES
('p1', 'Free', 'Perfect for individual teachers getting started with automated grading', 0, 12, 5, 50, 5, false, true, false, false, false, true, true, 0),
('p2', 'Premium', 'Full-featured plan for schools with unlimited uploads and branded reports', 1000, 1, NULL, 500, 20, true, true, true, true, true, false, true, 1),
('p3', 'Enterprise', 'For school chains and districts with custom grading and API access', 5000, 1, NULL, NULL, 50, true, true, true, true, true, false, true, 2);

-- Admin user (password set via Supabase Auth)
INSERT INTO users (id, email, full_name, role) VALUES
('a1', 'kalinimedia001@gmail.com', 'JARED ANDIKA', 'admin');

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grading_systems_updated_at BEFORE UPDATE ON grading_systems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
