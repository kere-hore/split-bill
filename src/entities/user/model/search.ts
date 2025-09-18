import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/axios";

export interface SearchUser {
  id: string; // database user ID for registered users, generated ID for custom users
  name: string;
  email?: string; // optional for registered users
  image?: string;
  isRegistered: boolean; // true if user exists in database
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
  const registeredUsers: SearchUser[] = (response.data.data || []).map((user: Omit<SearchUser, 'isRegistered'>) => ({
    ...user,
    isRegistered: true,
  }));
  
  // Add option to create custom user with just name
  const customUser: SearchUser = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: query.trim(),
    isRegistered: false,
  };
  
  // Only add custom user if not already in results
  const existingUser = registeredUsers.find((u) => 
    u.name.toLowerCase() === customUser.name.toLowerCase()
  );
  
  if (!existingUser) {
    return [...registeredUsers, customUser];
  }
  
  return registeredUsers;
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