import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCurrentUserProfile,
  useUpdateUserProfile,
} from "@/entities/user-profile";

const profileFormSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export function useProfileForm() {
  const { data: userProfileData } = useCurrentUserProfile();
  const updateProfileMutation = useUpdateUserProfile();

  const user = userProfileData?.success ? userProfileData.data : null;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      username: "",
      phone: "",
    },
  });
  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        username: user.username || "",
        phone: user.phone || "",
      });
    }
  }, [user?.name, user?.username, user?.phone, form, user]);

  const onSubmit = (data: ProfileFormData) => {
    const updateData = {
      name: data.name,
      username: data.username,
      ...(data.phone && data.phone.trim() !== "" && { phone: data.phone }),
    };

    updateProfileMutation.mutate(updateData);
  };

  return {
    form,
    onSubmit,
    isLoading: updateProfileMutation.isPending,
    user,
  };
}
