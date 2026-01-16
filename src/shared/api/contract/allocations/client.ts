import { api } from "@/shared/api/axios";
import {
  SaveAllocationsRequest,
  SaveAllocationsApiResponse,
  GetAllocationsApiResponse,
} from "./types";

/**
 * Save expense allocations for a group with WhatsApp broadcast generation
 * @param groupId - The unique identifier of the group
 * @param data - Allocation data including member splits and WhatsApp settings
 * @returns Promise resolving to saved allocations with WhatsApp URLs
 */
export const saveAllocations = async (
  groupId: string,
  data: SaveAllocationsRequest
): Promise<SaveAllocationsApiResponse> => {
  const response = await api.post(`/api/groups/${groupId}/allocations`, data);
  return response.data;
};

/**
 * Get allocation details for a specific member in a group
 * @param groupId - The unique identifier of the group
 * @param memberId - The unique identifier of the member
 * @returns Promise resolving to member's allocation details and payment status
 */
export const getAllocationDetails = async (
  groupId: string,
  memberId: string
): Promise<GetAllocationsApiResponse> => {
  const response = await api.get(
    `/api/groups/${groupId}/allocations/${memberId}`
  );
  return response.data;
};
