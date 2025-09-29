import { api } from "../../axios";
import { UsersResponse } from "./types";

export async function searchUsers(query: string = '') {
  const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&limit=50`);
  return response.data;
}
