import { useState } from 'react'
import { useSlackConfigs, useCreateSlackConfig, useDeleteSlackConfig } from '@/entities/slack-config'
import { toast } from 'sonner'

export function useSlackSettings() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)

  // Queries
  const { data: configs, isLoading: configsLoading } = useSlackConfigs()

  // Mutations
  const createConfig = useCreateSlackConfig()
  const deleteConfig = useDeleteSlackConfig()

  const handleCreateConfig = async (data: { name: string; webhookUrl: string; channelName: string }) => {
    try {
      await createConfig.mutateAsync(data)
      toast.success('Slack configuration created successfully')
      setIsConfigModalOpen(false)
    } catch (error) {
      toast.error('Failed to create Slack configuration')
    }
  }

  const handleDeleteConfig = async (configId: string) => {
    try {
      await deleteConfig.mutateAsync(configId)
      toast.success('Slack configuration deleted')
    } catch (error) {
      toast.error('Failed to delete Slack configuration')
    }
  }

  // Transform data to match entity types
  const transformedConfigs = (configs || []).map(config => ({
    ...config,
    createdAt: new Date(config.createdAt),
    updatedAt: new Date(config.updatedAt)
  }))

  return {
    // Data
    configs: transformedConfigs,
    
    // Loading states
    isLoading: configsLoading,
    isCreating: createConfig.isPending,
    isDeleting: deleteConfig.isPending,

    // Modal states
    isConfigModalOpen,
    setIsConfigModalOpen,

    // Actions
    handleCreateConfig,
    handleDeleteConfig
  }
}