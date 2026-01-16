import { ApiResponse } from "@/shared/types/api-response"

export interface User {
  id: string
  name: string
  email: string
  image?: string
  username: string
  clerkId: string
  createdAt: string
  updatedAt: string
}

export interface UsersData {
  users: User[]
}

export type UsersResponse = ApiResponse<UsersData>