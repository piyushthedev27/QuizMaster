-- TEMPORARY FIX: Disable RLS to get the application working
-- Run this in your Supabase SQL editor to temporarily disable Row Level Security
-- This allows the application to work while we properly configure Clerk authentication

-- Disable RLS on all tables temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated and anonymous users temporarily
GRANT ALL ON users TO authenticated, anon;
GRANT ALL ON questions TO authenticated, anon;
GRANT ALL ON quiz_attempts TO authenticated, anon;

-- Enable realtime for quiz_attempts (for leaderboard)
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_attempts;

-- Note: This is a temporary fix for development
-- You should re-enable RLS with proper Clerk integration for production