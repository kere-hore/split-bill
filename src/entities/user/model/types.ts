export interface User {
  id: string
  name: string
  email: string
  image?: string
  username: string
  clerkId: string
}

export interface SearchUser {
  id: string
  name: string
  email?: string
  image?: string
  username: string
  isRegistered: boolean
}