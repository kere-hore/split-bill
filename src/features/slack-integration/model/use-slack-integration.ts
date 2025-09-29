import { useState } from "react";
import { useSlackConfigs } from "@/entities/slack-config";
import {
  useSlackMappings,
  useUpdateSlackMappings,
  useShareToSlack,
} from "@/entities/slack-user-mapping";
import { toast } from "sonner";
import {
  useCreateSlackConfig,
  useDeleteSlackConfig,
} from "@/entities/slack-config";

export function useSlackIntegration(groupId: string) {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");

  // Queries
  const { data: configs, isLoading: configsLoading } = useSlackConfigs();
  const { data: mappings, isLoading: mappingsLoading } =
    useSlackMappings(groupId);

  // Mutations
  const createConfig = useCreateSlackConfig();
  const deleteConfig = useDeleteSlackConfig();
  const updateMappings = useUpdateSlackMappings(groupId);
  const shareToSlack = useShareToSlack(groupId);

  const handleCreateConfig = async (data: {
    name: string;
    webhookUrl: string;
    channelName: string;
  }) => {
    try {
      await createConfig.mutateAsync(data);
      toast.success("Slack configuration created successfully");
      setIsConfigModalOpen(false);
    } catch (error) {
      toast.error("Failed to create Slack configuration");
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    try {
      await deleteConfig.mutateAsync(configId);
      toast.success("Slack configuration deleted");
    } catch (error) {
      toast.error("Failed to delete Slack configuration");
    }
  };

  const handleUpdateMappings = async (
    mappingUpdates: Record<
      string,
      {
        slackUsername?: string;
        mappingStatus?: "pending" | "active" | "skipped";
      }
    >
  ) => {
    try {
      await updateMappings.mutateAsync({ mappings: mappingUpdates });
      toast.success("User mappings updated");
      setIsMappingModalOpen(false);
    } catch (error) {
      toast.error("Failed to update mappings");
    }
  };

  const handleShareToSlack = async (
    configId: string,
    mappingUpdates?: Record<string, string>
  ) => {
    try {
      const result = await shareToSlack.mutateAsync({
        configId,
        mappings: mappingUpdates,
      });

      if (result.data.sentToSlack) {
        toast.success("Message sent to Slack successfully");
      } else {
        toast.warning("Message generated but Slack delivery failed");
      }

      // Copy to clipboard as fallback
      if (result.data.slackMessage) {
        await navigator.clipboard.writeText(result.data.slackMessage);
        toast.info("Message copied to clipboard");
      }
    } catch (error) {
      toast.error("Failed to share to Slack");
    }
  };

  // Transform data to match entity types
  const transformedMappings = (mappings || []).map((mapping) => ({
    ...mapping,
    createdAt: new Date(mapping.createdAt),
    updatedAt: new Date(mapping.updatedAt),
  }));

  const transformedConfigs = (configs || []).map((config) => ({
    ...config,
    createdAt: new Date(config.createdAt),
    updatedAt: new Date(config.updatedAt),
  }));

  return {
    // Data
    configs: transformedConfigs,
    mappings: transformedMappings,

    // Loading states
    isLoading: configsLoading || mappingsLoading,
    isCreating: createConfig.isPending,
    isDeleting: deleteConfig.isPending,
    isUpdating: updateMappings.isPending,
    isSharing: shareToSlack.isPending,

    // Modal states
    isConfigModalOpen,
    setIsConfigModalOpen,
    isMappingModalOpen,
    setIsMappingModalOpen,
    selectedConfigId,
    setSelectedConfigId,

    // Actions
    handleCreateConfig,
    handleDeleteConfig,
    handleUpdateMappings,
    handleShareToSlack,
  };
}
