import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

declare global {
  var __prisma: PrismaClient | undefined
}

// Load environment variables
if (typeof window === 'undefined') {
  const { config } = require('dotenv')
  config({ path: '.env.local', override: false })
  config({ path: '.env', override: false })
}

// Create connection pool for Supabase
// Use DIRECT_URL to bypass pooler and RLS issues temporarily
let connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')))
  throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set')
}

console.log('Using connection string:', connectionString.replace(/:[^:@]*@/, ':****@'))

const pool = new Pool({ 
  connectionString,
  // Add connection options for better reliability
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

const adapter = new PrismaPg(pool)

export const prisma = globalThis.__prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}