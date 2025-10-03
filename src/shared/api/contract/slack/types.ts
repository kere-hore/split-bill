import { ApiResponse } from "@/shared/types/api-response"

export interface SlackConfig {
  id: string
  groupId: string
  name: string
  webhookUrl: string
  channelName: string
  enabledEvents: string[]
  messageFormat: string
  rateLimitPerMinute: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SlackUserMapping {
  id: string
  userId?: string
  groupId: string
  memberName: string
  memberEmail?: string
  slackUsername?: string
  mappingStatus: 'pending' | 'active' | 'skipped'
  createdAt: string
  updatedAt: string
}

export interface CreateSlackConfigRequest {
  name: string
  webhookUrl: string
  channelName: string
}

export interface UpdateMappingsRequest {
  mappings: Record<string, {
    slackUsername?: string
    mappingStatus?: 'pending' | 'active' | 'skipped'
  }>
}

export interface SlackShareRequest {
  configId: string
  mappings?: Record<string, string>
}

export interface SlackConfigData {
    configs: SlackConfig[]
}

export interface SlackMappingData {
    mappings: SlackUserMapping[]
}

export interface SlackShareData {
    slackMessage: string
    sentToSlack: boolean
}

export type SlackConfigsResponse = ApiResponse<SlackConfigData>

export type SlackMappingsResponse = ApiResponse<SlackMappingData>

export type SlackShareResponse = ApiResponse<SlackShareData>