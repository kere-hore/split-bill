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

export interface UsersResponse {
  success: boolean
  message: string
  data: {
    users: User[]
  }
}