import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/UserType";
import { userProfileService } from "@/services/userProfileService";
import { authService } from "@/services/auth";

export interface UserProfile extends User {
  avatar: string;
}

export function useUserProfile() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const userData = await userProfileService.fetchProfile();
      const avatar =
        userData.pfp ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          userData.fullName || userData.email
        )}&background=AC1754&color=FFFFFF`;

      const profileData = { ...userData, avatar };
      // Update local storage with latest data
      authService.updateUserInStorage(userData);
      return profileData;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { nickName?: string; pfp?: string }) => {
      const updatedUser = await userProfileService.updateProfile(data);
      const updated = {
        ...updatedUser,
        avatar: data.pfp ?? profile?.avatar,
      };
      authService.updateUserInStorage(updated);
      return updated;
    },
    onSuccess: (updatedProfile) => {
      // Update the cache with the new profile data
      queryClient.setQueryData(["userProfile"], updatedProfile);
    },
  });

  const save = async (data: { nickName?: string; pfp?: string }) => {
    if (!profile) return;
    try {
      await saveMutation.mutateAsync(data);
    } catch (err) {
      throw err;
    }
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  };

  return {
    profile,
    loading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load profile"
      : null,
    save,
    refresh,
  };
}
