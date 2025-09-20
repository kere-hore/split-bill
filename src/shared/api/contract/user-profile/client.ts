import axios from "axios";
import { UpdateProfileRequest, UpdateProfileResponse, UserProfile } from "./types";
import { ApiResponse } from "@/shared/types/api-response";

export const getCurrentUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  const response = await axios.get("/api/user/profile");
  return response.data;
};

export const updateUserProfile = async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  const response = await axios.put("/api/user/profile", data);
  return response.data;
};