-- Update existing users to have proper usernames
-- Run this in your Supabase SQL editor

-- Update users who don't have usernames yet
-- Extract username from email (part before @) for users without username
UPDATE users 
SET username = CASE 
  WHEN username IS NULL OR username = '' THEN 
    CASE 
      WHEN email LIKE '%@clerk.temp' THEN 
        CONCAT('user_', SUBSTRING(id, 1, 8))
      ELSE 
        SPLIT_PART(email, '@', 1)
    END
  ELSE username
END
WHERE username IS NULL OR username = '';

-- Verify the update
SELECT id, email, username FROM users ORDER BY "createdAt";