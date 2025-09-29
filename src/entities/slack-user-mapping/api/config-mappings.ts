import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConfigMappings, updateConfigMappings } from '@/shared/api/contract/slack/client'

export const configMappingKeys = {
  all: ['config-mappings'] as const,
  lists: () => [...configMappingKeys.all, 'list'] as const,
  list: (configId: string) => [...configMappingKeys.lists(), configId] as const,
}

export function useConfigMappings(configId: string) {
  return useQuery({
    queryKey: configMappingKeys.list(configId),
    queryFn: async () => {
      const response = await getConfigMappings(configId)
      return response.data.mappings
    },
    enabled: !!configId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateConfigMappings(configId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (mappings: Array<{ userId: string; slackUsername?: string }>) => 
      updateConfigMappings(configId, mappings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configMappingKeys.list(configId) })
    },
  })
}