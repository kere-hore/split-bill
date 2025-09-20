import { useMutation } from "@tanstack/react-query";
import { 
  saveAllocations as saveAllocationsContract,
  SaveAllocationsRequest 
} from "@/shared/api/contract/allocations";

export const useSaveAllocations = (groupId: string) => {
  return useMutation({
    mutationFn: (data: SaveAllocationsRequest) => saveAllocationsContract(groupId, data),
  });
};