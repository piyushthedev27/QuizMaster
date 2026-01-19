# Clerk Authentication + Supabase Database Setup Guide

This guide will help you set up Clerk authentication while keeping your Supabase database for data storage and realtime features.

## Architecture Overview

- **Authentication**: Clerk (handles user login, registration, sessions)
- **Database**: Supabase PostgreSQL (stores quiz data, questions, leaderboard)
- **Realtime**: Supabase Realtime (live leaderboard updates)

## 1. Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

## 2. Get Your Clerk Keys

1. In your Clerk dashboard, go to "API Keys"
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

## 3. Keep Your Supabase Database

You'll continue using your existing Supabase project for:
- Database storage (questions, quiz attempts, leaderboard)
- Realtime subscriptions (live leaderboard updates)
- Row Level Security (data access control)

Make sure you have these Supabase keys:
- **Project URL**
- **Anon Key** (for database access)
- **Service Role Key** (for seeding data)

## 4. Update Environment Variables

Update your `.env.local` file with both Clerk and Supabase keys:

```bash
# Clerk Configuration (for Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Configuration (for Database & Realtime)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration
DATABASE_URL=your_postgresql_connection_string
DIRECT_URL=your_postgresql_direct_connection_string
```

## 5. Configure Clerk Dashboard

1. In your Clerk dashboard, go to "User & Authentication" > "Email, Phone, Username"
2. Enable **Email** as a sign-in method
3. Optionally enable **Username** if you want usernames
4. Go to "User & Authentication" > "Social Connections" to add social login providers (optional)

## 6. Set Up Redirects

In your Clerk dashboard:
1. Go to "Paths"
2. Set the following paths:
   - **Sign-in page**: `/auth/login`
   - **Sign-up page**: `/auth/register`
   - **After sign-in**: `/dashboard`
   - **After sign-up**: `/dashboard`

## 7. Update Supabase RLS Policies (Important!)

Since user IDs now come from Clerk instead of Supabase Auth, you need to update your Row Level Security policies:

```sql
-- Update users table policy
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Update quiz_attempts policies  
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON quiz_attempts;
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Questions remain readable by all authenticated users (no change needed)
```

## 8. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Try signing up with a new account
4. Try signing in with your account
5. Verify that you're redirected to the dashboard after authentication
6. Test taking a quiz to ensure database operations work
7. Check the leaderboard for realtime updates

## What Changed

### Removed Supabase Auth Components:
- ✅ Removed `AuthContext.tsx`
- ✅ Removed `LoginForm.tsx` and `RegisterForm.tsx`
- ✅ Removed Supabase auth dependencies from API routes
- ✅ Updated all pages to use Clerk authentication

### Added Clerk Components:
- ✅ Clerk `SignIn` and `SignUp` components
- ✅ Updated `useAuth` hook to work with Clerk
- ✅ Updated middleware for Clerk route protection
- ✅ Updated all API routes to use Clerk authentication

### Kept Supabase Database:
- ✅ **Kept Supabase database** for all quiz data
- ✅ **Kept realtime subscriptions** for live leaderboard updates
- ✅ **Kept question delivery** and quiz functionality
- ✅ User IDs now come from Clerk but data storage remains in Supabase

## Benefits of This Hybrid Approach

- 🔐 **Better Authentication**: Clerk's industry-standard auth with better UX
- 📊 **Keep Your Data**: All your existing quiz data and questions remain
- ⚡ **Real-time Features**: Supabase realtime still works for live leaderboards
- 🔄 **Easy Migration**: Minimal disruption to existing functionality
- 📈 **Scalability**: Best of both worlds - Clerk auth + Supabase database

## Troubleshooting

### Common Issues:

1. **"Invalid publishable key"**: Make sure you copied the correct publishable key from Clerk dashboard
2. **"Authentication required" errors**: Check that your Clerk secret key is correct in `.env.local`
3. **Database connection issues**: Verify your Supabase keys are still correct
4. **RLS policy errors**: Make sure you updated the RLS policies to work with Clerk user IDs
5. **Realtime not working**: Check that your Supabase anon key has realtime permissions

### Need Help?

- Check the [Clerk Documentation](https://clerk.com/docs)
- Check the [Supabase Documentation](https://supabase.com/docs)
- Verify your environment variables are loaded correctly
- Make sure you restarted your development server after updating `.env.local`