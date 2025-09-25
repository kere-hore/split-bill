import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  getSlackMappings, 
  updateSlackMappings,
  shareToSlack
} from "@/shared/api/contract/slack"
import { UpdateMappingsRequest, SlackShareRequest } from "@/shared/api/contract/slack/types"

// Query Keys
export const slackMappingKeys = {
  all: ["slackMappings"] as const,
  lists: () => [...slackMappingKeys.all, "list"] as const,
  list: (groupId: string) => [...slackMappingKeys.lists(), groupId] as const,
}

// React Query Hooks
export function useSlackMappings(groupId: string) {
  return useQuery({
    queryKey: slackMappingKeys.list(groupId),
    queryFn: async () => {
      const response = await getSlackMappings(groupId)
      return response.data.mappings
    },
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateSlackMappings(groupId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateMappingsRequest) => updateSlackMappings(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slackMappingKeys.list(groupId) })
    },
  })
}

export function useShareToSlack(groupId: string) {
  return useMutation({
    mutationFn: (data: SlackShareRequest) => shareToSlack(groupId, data),
  })
}

// Cache Invalidation Helper
export function useInvalidateSlackMappings() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: slackMappingKeys.all }),
    invalidateList: (groupId: string) =>
      queryClient.invalidateQueries({ queryKey: slackMappingKeys.list(groupId) }),
  }
}