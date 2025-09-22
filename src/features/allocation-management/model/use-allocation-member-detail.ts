"use client";

import { useAllocationDetail } from "@/entities/allocation";
import { getErrorMessage, getErrorDetails } from "@/shared/lib/error-handler";

export function useAllocationMemberDetail(groupId: string, memberId: string) {
  const {
    data: allocation,
    isLoading: loading,
    error,
  } = useAllocationDetail(groupId, memberId);
  return {
    allocation: allocation || null,
    loading,
    errorMessage: error ? getErrorMessage(error) : null,
    errorDetails: error ? getErrorDetails(error) : null,
  };
}
