import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/axios";

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  search: (query: string) => [...userKeys.all, 'search', query] as const,
};

// API Function
export async function searchUsers(query: string): Promise<SearchUser[]> {
  if (!query.trim()) return [];
  
  const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
  return response.data.data || [];
}

// React Query Hook
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: userKeys.search(query),
    queryFn: () => searchUsers(query),
    enabled: query.trim().length >= 2, // Only search if query has 2+ characters
    staleTime: 30 * 1000, // 30 seconds
  });
}