import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client for database operations only (not auth)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable auth session persistence since we use Clerk
    autoRefreshToken: false, // Disable auto refresh since we use Clerk
  }
})

// Export the createClient function for compatibility
export { createClient }