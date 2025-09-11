import { NextResponse } from 'next/server'

export async function GET() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'DATABASE_URL'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  const health = {
    status: missingVars.length === 0 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    missingEnvVars: missingVars,
    clerkConfigured: !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
    databaseConfigured: !!process.env.DATABASE_URL
  }

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 500
  })
}