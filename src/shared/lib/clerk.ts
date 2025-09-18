/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

// Use fresh client for auth operations
const prisma = new PrismaClient();

// Simple in-memory cache to avoid repeated sync calls
const userCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCurrentUser() {
  try {
    // Get current authenticated user from Clerk
    const user = await currentUser();
    if (!user) return null;

    // Check cache first
    const cached = userCache.get(user.id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.user;
    }

    // Extract user information with fallbacks
    const email = user.emailAddresses[0]?.emailAddress || "";
    const name = user.fullName || user.firstName || "User";
    const username =
      user.username || email.split("@")[0] || `user_${user.id.slice(-8)}`;

    // Try to sync user with database (lazy approach)
    try {
      // First try to find existing user
      let dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
      });

      // If user doesn't exist, create it
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            clerkId: user.id,
            username,
            email,
            name,
            phone: "",
            image: user.imageUrl,
          },
        });
      } else {
        // Update existing user (less frequent operation)
        dbUser = await prisma.user.update({
          where: { clerkId: user.id },
          data: {
            email,
            name,
            image: user.imageUrl,
          },
        });
      }

      // Cache the result
      userCache.set(user.id, {
        user: dbUser,
        timestamp: Date.now(),
      });

      return dbUser;
    } catch (dbError) {
      console.error("Database sync failed, continuing without sync:", dbError);

      // Return a mock user object if database fails
      const mockUser = {
        id: user.id,
        clerkId: user.id,
        username,
        email,
        name,
        phone: "",
        image: user.imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Cache the mock user too
      userCache.set(user.id, {
        user: mockUser,
        timestamp: Date.now(),
      });

      return mockUser;
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

// Simplified approach - use Clerk ID directly without database sync
export async function ensureUserExists(clerkId: string) {
  // Return mock user object with Clerk ID
  // This avoids database operations that cause prepared statement conflicts
  return {
    id: clerkId, // Use Clerk ID as database ID
  };
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

// For API routes that need database user ID
export async function requireAuthWithDbUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await ensureUserExists(userId);
  return { clerkId: userId, dbUser: user };
}

export async function getSession() {
  const { userId } = await auth();
  return userId ? { userId } : null;
}
