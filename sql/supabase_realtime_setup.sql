-- Enable Realtime for quiz_attempts table
-- This script should be run in the Supabase SQL editor

-- Enable realtime for quiz_attempts table
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_attempts;

-- Verify that realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'quiz_attempts';

-- Optional: Enable realtime for users table if needed for user updates
-- ALTER PUBLICATION supabase_realtime ADD TABLE users;