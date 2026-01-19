-- Updated Supabase RLS Policies for Clerk Authentication
-- Run this script in your Supabase SQL editor to fix the "Tenant or user not found" errors

-- First, disable RLS temporarily to avoid conflicts
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Questions are viewable by authenticated users" ON questions;
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Quiz attempts are viewable by authenticated users" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can update own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Admins can manage quiz attempts" ON quiz_attempts;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES (Updated for Clerk)

-- Users can only read their own profile
-- Uses Clerk user ID from JWT token
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (
    id = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'sub',
      current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (
    id = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'sub',
      current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

-- Allow user registration (insert new users)
CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (
    id = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'sub',
      current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

-- QUESTIONS TABLE POLICIES

-- Questions are readable by all authenticated users
-- For now, allow all access to questions (no RLS needed for questions)
CREATE POLICY "Questions are viewable by all" ON questions
  FOR SELECT USING (true);

-- QUIZ_ATTEMPTS TABLE POLICIES

-- Users can only insert their own quiz attempts
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (
    user_id = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'sub',
      current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

-- Users can view all quiz attempts for leaderboard functionality
CREATE POLICY "Quiz attempts are viewable by all" ON quiz_attempts
  FOR SELECT USING (true);

-- Users can only update their own quiz attempts
CREATE POLICY "Users can update own quiz attempts" ON quiz_attempts
  FOR UPDATE USING (
    user_id = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'sub',
      current_setting('request.jwt.claims', true)::json->>'user_id'
    )
  );

-- ADMIN POLICIES (Updated for Clerk)

-- Admin users can manage all users
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = COALESCE(
        current_setting('request.jwt.claims', true)::json->>'sub',
        current_setting('request.jwt.claims', true)::json->>'user_id'
      )
      AND role = 'ADMIN'
    )
  );

-- Admin users can manage all questions
CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = COALESCE(
        current_setting('request.jwt.claims', true)::json->>'sub',
        current_setting('request.jwt.claims', true)::json->>'user_id'
      )
      AND role = 'ADMIN'
    )
  );

-- Admin users can manage all quiz attempts
CREATE POLICY "Admins can manage quiz attempts" ON quiz_attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = COALESCE(
        current_setting('request.jwt.claims', true)::json->>'sub',
        current_setting('request.jwt.claims', true)::json->>'user_id'
      )
      AND role = 'ADMIN'
    )
  );

-- REALTIME SUBSCRIPTIONS SETUP
-- Enable realtime for quiz_attempts table for leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_attempts;

-- Grant necessary permissions
GRANT SELECT ON quiz_attempts TO authenticated, anon;
GRANT INSERT ON quiz_attempts TO authenticated, anon;
GRANT UPDATE ON quiz_attempts TO authenticated, anon;

GRANT SELECT ON questions TO authenticated, anon;
GRANT SELECT ON users TO authenticated, anon;
GRANT INSERT ON users TO authenticated, anon;
GRANT UPDATE ON users TO authenticated, anon;

-- For development/testing, you might want to temporarily disable RLS
-- Uncomment these lines if you want to disable RLS for testing:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE quiz_attempts DISABLE ROW LEVEL SECURITY;