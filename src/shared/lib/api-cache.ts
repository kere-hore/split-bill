import { NextResponse } from "next/server";
import { ApiSuccessResponse } from "@/shared/types/api-response";

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

// In-memory cache for API responses
const cache = new Map<string, CacheEntry>();

export function getCachedResponse<T = unknown>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCachedResponse<T = unknown>(key: string, data: T, ttlMs: number = 300000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
}

export function createCachedResponse<T>(
  data: T, 
  message: string, 
  ttlSeconds: number = 300
): NextResponse<ApiSuccessResponse<T>> {
  const response = NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  });
  
  // Add cache headers
  response.headers.set('Cache-Control', `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`);
  response.headers.set('X-Cache-TTL', ttlSeconds.toString());
  
  return response;
}

// Clear cache periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        cache.delete(key);
      }
    }
  }, 60000); // Clean every minute
}