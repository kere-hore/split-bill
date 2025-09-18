"use client";

import { useGroupById } from "@/entities/group";

export function useGroupDetail(id: string) {
  const { data: group, isLoading: loading, error, refetch } = useGroupById(id);

  return {
    group: group || null,
    loading,
    error: error?.message || null,
    refetch,
  };
}