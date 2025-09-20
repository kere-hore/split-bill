export * from "./api/allocations";
// Re-export types from shared contract
export type { 
  SplitMethod, 
  SplitConfig, 
  ItemAllocation, 
  MemberAllocation 
} from "@/shared/api/contract/allocations";