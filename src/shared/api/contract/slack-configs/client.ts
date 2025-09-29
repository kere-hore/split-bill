import axios from "axios";
import { SlackConfigsResponse } from "./types";

export const slackConfigsApi = {
  getConfigs: async (): Promise<SlackConfigsResponse> => {
    const response = await axios.get("/api/slack/configs");
    return response.data;
  },
};