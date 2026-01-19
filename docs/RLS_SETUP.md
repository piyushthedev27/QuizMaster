# Row Level Security (RLS) Setup for QuizMaster Platform

This document explains how to configure Row Level Security policies for the QuizMaster platform in Supabase.

## Overview

Row Level Security (RLS) ensures that users can only access data they are authorized to see and modify. The policies implement the following security requirements:

### Security Requirements Implemented

1. **Users Table (Requirements 8.4)**:
   - Users can only view and update their own profile information
   - New users can register (insert their own record)
   - Admins can manage all user records

2. **Questions Table (Requirements 8.1)**:
   - All authenticated users can read questions (read-only access)
   - Only admins can modify questions
   - Prevents users from manipulating quiz content

3. **Quiz Attempts Table (Requirements 8.2, 8.3)**:
   - Users can only insert their own quiz attempts
   - Users can view all quiz attempts (for leaderboard functionality)
   - Users can only update their own quiz attempts
   - Prevents manipulation of other users' scores

4. **Admin Access (Requirements 8.5)**:
   - Admin users have full access to all tables
   - Admin role is checked through the users table

## Setup Instructions

### Step 1: Run the RLS Policies

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase_rls_policies.sql`
4. Execute the script

### Step 2: Verify Policies

After running the script, verify that:

1. RLS is enabled on all tables:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('users', 'questions', 'quiz_attempts');
   ```

2. Policies are created:
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename IN ('users', 'questions', 'quiz_attempts');
   ```

### Step 3: Test Policies

Test the policies by:

1. Creating test users with different roles
2. Attempting to access data as different users
3. Verifying that unauthorized access is blocked

## Policy Details

### Users Table Policies

- **"Users can view own profile"**: Users can SELECT only their own record
- **"Users can update own profile"**: Users can UPDATE only their own record  
- **"Allow user registration"**: Users can INSERT their own record during registration
- **"Admins can manage users"**: Admin users can perform all operations

### Questions Table Policies

- **"Questions are viewable by authenticated users"**: All authenticated users can SELECT questions
- **"Admins can manage questions"**: Admin users can perform all operations on questions

### Quiz Attempts Table Policies

- **"Users can insert own quiz attempts"**: Users can INSERT only their own quiz attempts
- **"Quiz attempts are viewable by authenticated users"**: All authenticated users can SELECT quiz attempts (for leaderboard)
- **"Users can update own quiz attempts"**: Users can UPDATE only their own quiz attempts
- **"Admins can manage quiz attempts"**: Admin users can perform all operations

## Realtime Configuration

The script also configures Supabase Realtime for the `quiz_attempts` table to enable live leaderboard updates.

## Security Notes

1. All policies use `auth.uid()` to identify the current user
2. Admin privileges are checked by querying the users table for the ADMIN role
3. The policies prevent users from accessing or modifying data they don't own
4. Realtime subscriptions respect the same RLS policies

## Troubleshooting

If you encounter issues:

1. Ensure your Supabase project has authentication enabled
2. Verify that the database schema matches the Prisma schema
3. Check that users have the correct role assignments
4. Test policies with different user accounts

## Requirements Validation

This RLS setup validates the following requirements:

- **8.1**: Questions are read-only for users ✅
- **8.2**: Users can only write their own quiz attempts ✅  
- **8.3**: Users cannot modify existing questions or other users' results ✅
- **8.4**: Users can only view their own profile information ✅
- **8.5**: RLS policies are implemented for all data access operations ✅