import { api } from "@/shared/api/axios";
import { 
  CreateSlackConfigRequest, 
  UpdateMappingsRequest, 
  SlackShareRequest,
  SlackConfigsResponse,
  SlackMappingsResponse,
  SlackShareResponse
} from './types'

export async function getSlackConfigs(): Promise<SlackConfigsResponse> {
  const response = await api.get('/user/slack/configs')
  return response.data
}

export async function createSlackConfig(data: CreateSlackConfigRequest): Promise<SlackConfigsResponse> {
  const response = await api.post('/user/slack/configs', data)
  return response.data
}

export async function deleteSlackConfig(configId: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete(`/user/slack/configs/${configId}`)
  return response.data
}

export async function getConfigMappings(configId: string): Promise<{ success: boolean; data: { mappings: any[] } }> {
  const response = await api.get(`/slack/configs/${configId}/mappings`)
  return response.data
}

export async function updateConfigMappings(configId: string, mappings: Array<{ userId: string; slackUsername?: string }>): Promise<{ success: boolean; message: string }> {
  const response = await api.post(`/slack/configs/${configId}/mappings`, { mappings })
  return response.data
}

export async function getSlackMappings(groupId: string): Promise<SlackMappingsResponse> {
  const response = await api.get(`/groups/${groupId}/slack/mappings`)
  return response.data
}

export async function updateSlackMappings(groupId: string, data: UpdateMappingsRequest): Promise<SlackMappingsResponse> {
  const response = await api.post(`/groups/${groupId}/slack/mappings`, data)
  return response.data
}

export async function shareToSlack(groupId: string, data: SlackShareRequest): Promise<SlackShareResponse> {
  const response = await api.post(`/groups/${groupId}/slack/share`, data)
  return response.data
}