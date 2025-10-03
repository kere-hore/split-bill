import { ApiResponse } from "@/shared/types/api-response";

export interface UpdateProfileRequest {
  name?: string;
  username?: string;
  phone?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  image: string | null;
  updatedAt: string;
}

export type GetProfileResponse = ApiResponse<UserProfile>;

export type UpdateProfileResponse = ApiResponse<UserProfile>;