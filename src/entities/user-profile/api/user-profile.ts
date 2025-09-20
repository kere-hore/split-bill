import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserProfile, updateUserProfile } from "@/shared/api/contract/user-profile";
import { toast } from "sonner";

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: getCurrentUserProfile,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });
};