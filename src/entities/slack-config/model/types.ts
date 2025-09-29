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
  createdAt: Date
  updatedAt: Date
}

export interface CreateSlackConfigData {
  name: string
  webhookUrl: string
  channelName: string
}

export interface UpdateSlackConfigData {
  name?: string
  webhookUrl?: string
  channelName?: string
  isActive?: boolean
}