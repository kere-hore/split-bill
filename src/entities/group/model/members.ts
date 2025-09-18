import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/axios";
import { groupKeys } from "../api/groups";

// API Functions
export async function addMemberToGroup(groupId: string, data: { 
  userId: string | null;
  name: string;
}) {
  const response = await api.post(`/groups/${groupId}/members`, data);
  return response.data;
}

export async function removeMemberFromGroup(groupId: string, memberId: string) {
  const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
  return response.data;
}

// React Query Hooks
export function useAddMember(groupId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { 
      userId: string | null;
      name: string;
    }) => addMemberToGroup(groupId, data),
    onSuccess: () => {
      // Invalidate group detail to refresh members list
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
  });
}

export function useRemoveMember(groupId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (memberId: string) => 
      removeMemberFromGroup(groupId, memberId),
    onSuccess: () => {
      // Invalidate group detail to refresh members list
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
  });
}