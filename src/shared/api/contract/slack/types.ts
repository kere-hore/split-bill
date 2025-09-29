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

export interface SlackConfigsResponse {
  success: boolean
  message: string
  data: {
    configs: SlackConfig[]
  }
  timestamp: string
}

export interface SlackMappingsResponse {
  success: boolean
  message: string
  data: {
    mappings: SlackUserMapping[]
  }
  timestamp: string
}

export interface SlackShareResponse {
  success: boolean
  message: string
  data: {
    slackMessage: string
    sentToSlack: boolean
  }
  timestamp: string
}