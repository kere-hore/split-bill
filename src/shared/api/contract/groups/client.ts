import { api } from "@/shared/api/axios";
import { GetGroupsRequest, GetGroupsResponse, Group } from './types'

export async function getGroups(params: GetGroupsRequest = {}): Promise<GetGroupsResponse> {
  const response = await api.get('/groups', { params })
  return response.data
}

export async function getGroupById(id: string): Promise<{ success: boolean; message: string; data: Group; timestamp: string }> {
  const response = await api.get(`/groups/${id}`)
  return response.data
}