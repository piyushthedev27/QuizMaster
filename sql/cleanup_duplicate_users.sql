-- Cleanup script for duplicate user issues
-- Run this in your Supabase SQL editor if you're still getting unique constraint errors

-- First, let's see what duplicate emails we have
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Remove duplicate users (keep the first one created)
-- This will also cascade delete their quiz attempts due to the foreign key constraint
WITH duplicates AS (
  SELECT id, email, 
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY "createdAt" ASC) as rn
  FROM users
)
DELETE FROM users 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Clean up any orphaned quiz attempts (shouldn't be any due to cascade, but just in case)
DELETE FROM quiz_attempts 
WHERE "userId" NOT IN (SELECT id FROM users);

-- Verify cleanup
SELECT 'Users after cleanup:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Quiz attempts after cleanup:' as info, COUNT(*) as count FROM quiz_attempts;