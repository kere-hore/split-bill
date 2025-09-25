import { api } from '../../axios'
import { 
  CreateSlackConfigRequest, 
  UpdateMappingsRequest, 
  SlackShareRequest,
  SlackConfigsResponse,
  SlackMappingsResponse,
  SlackShareResponse
} from './types'

export async function getSlackConfigs(groupId: string): Promise<SlackConfigsResponse> {
  const response = await api.get(`/groups/${groupId}/slack/configs`)
  return response.data
}

export async function createSlackConfig(groupId: string, data: CreateSlackConfigRequest): Promise<SlackConfigsResponse> {
  const response = await api.post(`/groups/${groupId}/slack/configs`, data)
  return response.data
}

export async function deleteSlackConfig(groupId: string, configId: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete(`/groups/${groupId}/slack/configs/${configId}`)
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