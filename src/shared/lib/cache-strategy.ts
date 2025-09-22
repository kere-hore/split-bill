import { getCachedResponse, setCachedResponse } from "./api-cache";

// Cache key generators
export const CacheKeys = {
  userGroups: (userId: string, page: number, limit: number, status: string) =>
    `user:${userId}:groups:${page}:${limit}:${status}`,
  groupDetail: (groupId: string) => `group:${groupId}:detail`,
  groupMembers: (groupId: string) => `group:${groupId}:members`,
  settlements: (groupId: string) => `group:${groupId}:settlements`,
} as const;

// Cache TTL configurations (in milliseconds)
export const CacheTTL = {
  userGroups: 5 * 60 * 1000, // 5 minutes
  groupDetail: 10 * 60 * 1000, // 10 minutes
  groupMembers: 15 * 60 * 1000, // 15 minutes
  settlements: 2 * 60 * 1000, // 2 minutes (more dynamic)
} as const;

// Cache invalidation patterns
export const invalidateUserCache = (userId: string) => {
  // In production, implement pattern-based cache invalidation
  console.log(`Invalidating cache for user: ${userId}`);
};

export const invalidateGroupCache = (groupId: string) => {
  // In production, implement pattern-based cache invalidation
  console.log(`Invalidating cache for group: ${groupId}`);
};

// Wrapper for cached API calls
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CacheTTL.userGroups
): Promise<T> {
  // Try cache first
  const cached = getCachedResponse<T>(key);
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Cache the result
  setCachedResponse(key, data, ttl);

  return data;
}
