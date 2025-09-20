import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    errorFormat: 'minimal',
    datasources: {
      db: {
        url: process.env.DATABASE_URL?.includes('?') 
          ? `${process.env.DATABASE_URL}&pgbouncer=true&connection_limit=1`
          : `${process.env.DATABASE_URL}?pgbouncer=true&connection_limit=1`,
      },
    },
  });

// Force disconnect and reconnect to clear prepared statements
if (process.env.NODE_ENV === "development") {
  setInterval(async () => {
    try {
      await prisma.$disconnect();
      await prisma.$connect();
    } catch (error) {
      console.warn('Prisma reconnection failed:', error);
    }
  }, 30000); // Every 30 seconds
}

// Graceful shutdown
if (process.env.NODE_ENV !== "production") {
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
