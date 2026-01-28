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

// Enhanced connection pool configuration for better reliability
const pool = new Pool({ 
  connectionString,
  // Connection pool settings
  max: 10, // Reduced max connections to avoid limits
  min: 2, // Minimum connections to keep alive
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Increased timeout to 10s
  // Additional reliability settings
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  allowExitOnIdle: false,
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

pool.on('connect', () => {
  console.log('Database pool connected')
})

pool.on('remove', () => {
  console.log('Client removed from pool')
})

const adapter = new PrismaPg(pool)

// Enhanced Prisma client configuration
export const prisma = globalThis.__prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

// Add connection testing
async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('Database connection test successful')
  } catch (error) {
    console.error('Database connection test failed:', error)
  }
}

// Test connection on startup
if (process.env.NODE_ENV !== 'production') {
  testConnection()
  globalThis.__prisma = prisma
}

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await prisma.$disconnect()
  await pool.end()
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  await pool.end()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  await pool.end()
  process.exit(0)
})