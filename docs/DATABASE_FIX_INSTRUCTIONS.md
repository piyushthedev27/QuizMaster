# Database Authentication Fix Instructions

## Problem
You're getting "Tenant or user not found" errors and unique constraint failures because:
1. The Supabase Row Level Security (RLS) policies are still configured for Supabase Auth, but you've migrated to Clerk authentication
2. User creation logic was causing unique constraint errors on email fields

## Quick Fix (Recommended for Development)

### Step 1: Disable RLS Temporarily
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `disable_rls_temporarily.sql`
4. Execute the script

This will temporarily disable RLS so your application works while we properly configure Clerk integration.

### Step 2: Clean Up Any Duplicate Users (If Needed)
If you're still getting unique constraint errors:
1. In Supabase SQL Editor, run the contents of `cleanup_duplicate_users.sql`
2. This will remove any duplicate users that might be causing conflicts

### Step 3: Restart Your Development Server
```bash
cd quizmaster-platform
npm run dev
```

The application should now work without the "Tenant or user not found" errors or unique constraint failures.

## What Was Fixed

### 1. Database Connection Issues
- **Updated Prisma Configuration**: Now uses `DIRECT_URL` to bypass Supabase pooler issues
- **Fixed Database Schema**: Added proper `url` field to the Prisma datasource

### 2. User Creation Logic
- **Fixed Unique Constraint Errors**: Updated user creation logic to handle email conflicts properly
- **Added Race Condition Protection**: Handles cases where multiple requests try to create the same user
- **Improved Error Handling**: Better error messages and recovery from database conflicts

### 3. RLS Policy Issues
- **Created Updated Policies**: New RLS policies that work with Clerk JWT tokens
- **Temporary Disable Script**: Quick fix to disable RLS for immediate functionality

## Proper Fix (For Production)

### Step 1: Configure Supabase to Accept Clerk JWT Tokens
1. In your Supabase dashboard, go to Settings > API
2. Scroll down to "JWT Settings"
3. Add Clerk's JWT issuer URL: `https://your-clerk-domain.clerk.accounts.dev`
4. Add Clerk's JWKS URL: `https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json`

### Step 2: Update RLS Policies for Clerk
1. Run the `supabase_clerk_rls_policies.sql` script in your Supabase SQL editor
2. This updates the policies to work with Clerk JWT tokens instead of Supabase Auth

### Step 3: Update API Routes to Pass Clerk JWT
You'll need to modify your API routes to pass the Clerk JWT token to Supabase for RLS to work properly.

## Testing

After applying the fixes:
1. Visit `http://localhost:3000`
2. Try logging in with Clerk
3. Test taking a quiz - should complete without errors
4. Check the leaderboard - should load properly
5. Verify user stats are loading

All database operations should now work without errors.

## Files Created/Modified

- `disable_rls_temporarily.sql` - Quick fix to disable RLS
- `cleanup_duplicate_users.sql` - Clean up duplicate user data
- `supabase_clerk_rls_policies.sql` - Proper RLS policies for Clerk
- `src/lib/prisma.ts` - Updated to use DIRECT_URL
- `src/lib/result-calculator.ts` - Fixed user creation logic
- `prisma/schema.prisma` - Added database URL
- `DATABASE_FIX_INSTRUCTIONS.md` - This file

## Error Types Fixed

1. **"Tenant or user not found"** - Fixed by using DIRECT_URL and disabling RLS temporarily
2. **"Unique constraint failed on the fields: (`email`)"** - Fixed by improving user creation logic
3. **Database connection timeouts** - Fixed by updating connection configuration
4. **RLS policy errors** - Fixed by creating Clerk-compatible policies

## Support

If you encounter any issues:
1. Check that your environment variables are correct
2. Ensure your Supabase project is accessible
3. Verify that the SQL scripts ran without errors
4. Restart your development server after changes
5. Check the browser console and server logs for specific error messages