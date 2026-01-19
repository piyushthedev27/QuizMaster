# Clerk Username Collection Setup

## Configure Clerk to Collect Usernames During Signup

### Step 1: Enable Username Collection in Clerk Dashboard

1. **Go to your Clerk Dashboard**
   - Visit [https://dashboard.clerk.com](https://dashboard.clerk.com)
   - Select your QuizMaster project

2. **Navigate to User & Authentication Settings**
   - Click on "User & Authentication" in the left sidebar
   - Click on "Email, Phone, Username"

3. **Enable Username Field**
   - Toggle ON "Username" 
   - Set it to "Required" (not optional)
   - This will make username collection mandatory during signup

4. **Configure Username Settings**
   - Minimum length: 3 characters
   - Maximum length: 20 characters
   - Allow special characters: No (recommended)
   - Case sensitive: No (recommended)

### Step 2: Update Sign-up Flow

The username field will now automatically appear in your Clerk SignUp component. Users will be required to choose a username when they register.

### Step 3: Update Existing Users (Run SQL Scripts)

1. **Update existing users with usernames**:
   - Go to your Supabase dashboard → SQL Editor
   - Run the contents of `update_usernames.sql`
   - This will give existing users proper usernames

### Step 4: Test the Changes

1. **Test new user registration**:
   - Go to `/auth/register`
   - Verify that username field appears
   - Complete registration with a username

2. **Test leaderboard**:
   - Take a quiz
   - Check that your username appears in the leaderboard
   - Verify only top 3 attempts per user are shown

## What This Fixes

### ✅ Username Collection
- New users must provide a username during signup
- Usernames are stored in the database
- Usernames are displayed in the leaderboard instead of random IDs

### ✅ Leaderboard Improvements
- Shows only top 3 attempts per user (not all attempts)
- Displays actual usernames instead of "user_37kjnGAe2LX5slCXxMITiMmviaX"
- Better ranking system per user

### ✅ Database Updates
- Existing users get proper usernames
- New user creation includes username
- Improved user experience

## Files Modified

- `src/lib/result-calculator.ts` - Updated leaderboard logic and user creation
- `src/app/api/quiz/complete/route.ts` - Pass username to database
- `src/app/auth/register/page.tsx` - Updated Clerk configuration
- `update_usernames.sql` - Script to fix existing users
- `CLERK_USERNAME_SETUP.md` - This instruction file

## Expected Results

After completing these steps:

1. **New users** will be prompted for a username during signup
2. **Leaderboard** will show only top 3 attempts per user with proper usernames
3. **Existing users** will have usernames based on their email or user ID
4. **No more random user IDs** in the leaderboard display

## Troubleshooting

If usernames don't appear:
1. Check Clerk dashboard settings are saved
2. Verify the SQL script ran successfully
3. Restart your development server
4. Clear browser cache and try again