import axios from "axios";
import { SaveAllocationsRequest, SaveAllocationsApiResponse } from "./types";

export const saveAllocations = async (
  groupId: string,
  data: SaveAllocationsRequest
): Promise<SaveAllocationsApiResponse> => {
  const response = await axios.post(`/api/groups/${groupId}/allocations`, data);
  return response.data;
};