-- Supabase Row Level Security Policies for QuizMaster Platform
-- Run this script in your Supabase SQL editor

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Questions are viewable by authenticated users" ON questions;
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Quiz attempts are viewable by authenticated users" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can update own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Admins can manage quiz attempts" ON quiz_attempts;

-- USERS TABLE POLICIES

-- Users can only read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Allow user registration (insert new users)
CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- QUESTIONS TABLE POLICIES

-- Questions are readable by all authenticated users
CREATE POLICY "Questions are viewable by authenticated users" ON questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- QUIZ_ATTEMPTS TABLE POLICIES

-- Users can only insert their own quiz attempts
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can view all quiz attempts for leaderboard functionality
CREATE POLICY "Quiz attempts are viewable by authenticated users" ON quiz_attempts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only update their own quiz attempts (if needed)
CREATE POLICY "Users can update own quiz attempts" ON quiz_attempts
  FOR UPDATE USING (auth.uid()::text = user_id);

-- ADMIN POLICIES (Optional - for admin functionality)

-- Admin users can manage all users
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- Admin users can manage all questions
CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- Admin users can manage all quiz attempts
CREATE POLICY "Admins can manage quiz attempts" ON quiz_attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- REALTIME SUBSCRIPTIONS SETUP
-- Enable realtime for quiz_attempts table for leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_attempts;

-- Grant necessary permissions for authenticated users
GRANT SELECT ON quiz_attempts TO authenticated;
GRANT INSERT ON quiz_attempts TO authenticated;
GRANT UPDATE ON quiz_attempts TO authenticated;

GRANT SELECT ON questions TO authenticated;
GRANT SELECT ON users TO authenticated;
GRANT INSERT ON users TO authenticated;
GRANT UPDATE ON users TO authenticated;