import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'

export interface AuthUser {
  id: string
  email: string
  username?: string
  role: 'student' | 'admin'
}

export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): AuthContextType {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerkAuth()

  const user: AuthUser | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    username: clerkUser.username || clerkUser.firstName || undefined,
    role: 'student' // Default role, can be customized based on Clerk metadata
  } : null

  const signOut = async () => {
    await clerkSignOut()
  }

  return {
    user,
    loading: !isLoaded,
    signOut
  }
}