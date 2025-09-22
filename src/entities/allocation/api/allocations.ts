import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAllocationDetails,
  saveAllocations as saveAllocationsContract,
  SaveAllocationsRequest,
} from "@/shared/api/contract/allocations";
import { parseError } from "@/shared/lib/error-handler";

export const allocationKeys = {
  detail: (groupId: string, memberId: string) =>
    ["allocations", groupId, memberId] as const,
};
export const useSaveAllocations = (groupId: string) => {
  return useMutation({
    mutationFn: (data: SaveAllocationsRequest) =>
      saveAllocationsContract(groupId, data),
  });
};

export const useAllocationDetail = (groupId: string, memberId: string) => {
  return useQuery({
    queryKey: allocationKeys.detail(groupId, memberId),
    queryFn: async () => {
      try {
        const response = await getAllocationDetails(groupId, memberId);
        console.log({ response });
        return response.data;
      } catch (error) {
        // Parse error and re-throw with consistent format
        const parsedError = parseError(error);
        const enhancedError = new Error(parsedError.message);
        (enhancedError as any).details = parsedError.details;
        (enhancedError as any).status = parsedError.status;
        throw enhancedError;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
