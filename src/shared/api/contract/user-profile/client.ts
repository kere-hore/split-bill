import axios from "axios";
import { GetProfileResponse, UpdateProfileRequest, UpdateProfileResponse } from "./types";

export const getCurrentUserProfile = async (): Promise<GetProfileResponse> => {
  const response = await axios.get("/api/user/profile");
  return response.data;
};

export const updateUserProfile = async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  const response = await axios.put("/api/user/profile", data);
  return response.data;
};