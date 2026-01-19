-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Questions are readable by all authenticated users
CREATE POLICY "Questions are viewable by authenticated users" ON questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only insert their own quiz attempts
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can view all quiz attempts for leaderboard (but not modify others')
CREATE POLICY "Quiz attempts are viewable by authenticated users" ON quiz_attempts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only update their own quiz attempts
CREATE POLICY "Users can update own quiz attempts" ON quiz_attempts
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Admin users can manage all data (if needed for admin functionality)
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage quiz attempts" ON quiz_attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );