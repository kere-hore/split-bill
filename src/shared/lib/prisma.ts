import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL, // Fallback to DATABASE_URL
    },
  },
  log: ['error'],
})

// Add connection health check
export async function ensurePrismaConnection() {
  try {
    await prisma.$connect()
    return true
  } catch (error) {
    console.error('Prisma connection failed:', error)
    return false
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma