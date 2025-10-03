import { api } from '@/shared/api'
import { SlackConfigsResponse } from "./types";


export async function getConfigsSlack(): Promise<SlackConfigsResponse> {
  const response = await api.get("/api/slack/configs");
  return response.data;
}