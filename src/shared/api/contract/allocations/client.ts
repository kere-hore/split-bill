import axios from "axios";
import {
  SaveAllocationsRequest,
  SaveAllocationsApiResponse,
  GetAllocationsApiResponse,
} from "./types";

export const saveAllocations = async (
  groupId: string,
  data: SaveAllocationsRequest
): Promise<SaveAllocationsApiResponse> => {
  const response = await axios.post(`/api/groups/${groupId}/allocations`, data);
  return response.data;
};

export const getAllocationDetails = async (
  groupId: string,
  memberId: string
): Promise<GetAllocationsApiResponse> => {
  const response = await axios.get(
    `/api/groups/${groupId}/allocations/${memberId}`
  );
  return response.data;
};
