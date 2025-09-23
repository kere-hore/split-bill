import { api } from "../../axios";
import {
  SlackConfigInput,
  SlackConfigResponse,
  SlackTestResponse,
} from "./types";

export async function getSlackConfig(
  groupId: string
): Promise<SlackConfigResponse> {
  const response = await api.get(`/groups/${groupId}/slack-config`);
  return response.data;
}

export async function updateSlackConfig(
  groupId: string,
  config: SlackConfigInput
): Promise<SlackConfigResponse> {
  const response = await api.put(`/groups/${groupId}/slack-config`, config);
  return response.data;
}

export async function deleteSlackConfig(
  groupId: string
): Promise<{ success: boolean; message: string }> {
  const response = await api.delete(`/groups/${groupId}/slack-config`);
  return response.data;
}

export async function testSlackConfig(
  groupId: string
): Promise<SlackTestResponse> {
  const response = await api.post(`/groups/${groupId}/slack-config/test`);
  return response.data;
}
export interface ShareToSlackRequest {
  webhookUrl: string;
  channel?: string;
  messageType?: "summary" | "detailed";
  includeMembers?: boolean;
  customMessage?: string;
}

export interface ShareToSlackResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    message: string;
    publicUrl: string;
  };
  timestamp: string;
}

export async function shareToSlack(
  groupId: string,
  shareData: ShareToSlackRequest
): Promise<ShareToSlackResponse> {
  const response = await api.post(`/groups/${groupId}/share/slack`, shareData);
  return response.data;
}
