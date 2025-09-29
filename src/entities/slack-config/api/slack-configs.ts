import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  getSlackConfigs, 
  createSlackConfig, 
  deleteSlackConfig 
} from "@/shared/api/contract/slack"
import { CreateSlackConfigRequest } from "@/shared/api/contract/slack/types"

// Query Keys
export const slackConfigKeys = {
  all: ["slackConfigs"] as const,
  lists: () => [...slackConfigKeys.all, "list"] as const,
  list: (groupId: string) => [...slackConfigKeys.lists(), groupId] as const,
}

// React Query Hooks
export function useSlackConfigs() {
  return useQuery({
    queryKey: slackConfigKeys.lists(),
    queryFn: async () => {
      const response = await getSlackConfigs()
      return response.data.configs
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateSlackConfig() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateSlackConfigRequest) => createSlackConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slackConfigKeys.lists() })
    },
  })
}

export function useDeleteSlackConfig() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (configId: string) => deleteSlackConfig(configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slackConfigKeys.lists() })
    },
  })
}

// Cache Invalidation Helper
export function useInvalidateSlackConfigs() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: slackConfigKeys.all }),
    invalidateList: (groupId: string) =>
      queryClient.invalidateQueries({ queryKey: slackConfigKeys.list(groupId) }),
  }
}