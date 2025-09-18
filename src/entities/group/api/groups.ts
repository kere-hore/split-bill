import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGroups as getGroupsContract,
  getGroupById as getGroupByIdContract,
} from "@/shared/api/contract/groups";

export interface GetGroupsParams {
  page?: number;
  limit?: number;
  status?: "outstanding" | "allocated" | "all";
}

// Query Keys
export const groupKeys = {
  all: ["groups"] as const,
  lists: () => [...groupKeys.all, "list"] as const,
  list: (params: GetGroupsParams) => [...groupKeys.lists(), params] as const,
  details: () => [...groupKeys.all, "detail"] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
};

// React Query Hooks
export function useGroups(params: GetGroupsParams = {}) {
  return useQuery({
    queryKey: groupKeys.list(params),
    queryFn: async () => {
      const response = await getGroupsContract(params);
      return response.data.groups; // Extract groups array from API response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGroupById(id: string) {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: async () => {
      const response = await getGroupByIdContract(id);
      return response.data; // Extract data from API response
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Cache Invalidation Helper
export function useInvalidateGroups() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: groupKeys.all }),
    invalidateList: (params?: GetGroupsParams) =>
      params
        ? queryClient.invalidateQueries({ queryKey: groupKeys.list(params) })
        : queryClient.invalidateQueries({ queryKey: groupKeys.lists() }),
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(id) }),
  };
}
