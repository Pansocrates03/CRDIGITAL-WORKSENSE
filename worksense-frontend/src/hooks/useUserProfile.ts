import { useEffect, useState } from "react";
import { User } from "@/types/UserType";
import apiClient from "@/api/apiClient";
import { authService } from "@/services/auth";
import { toast } from "sonner";

export interface UserProfile extends User {
  avatar: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const stored = localStorage.getItem("user");
        if (!stored) throw new Error("User data not found");
        const user: User = JSON.parse(stored);
        const avatar =
          user.pfp ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.fullName || user.email
          )}&background=AC1754&color=FFFFFF`;
        setProfile({ ...user, avatar });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load";
        setError(msg);
        toast.error("Failed to load user data", { description: msg });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** Guarda nickname o avatar */
  const save = async (data: { nickName?: string; pfp?: string }) => {
    if (!profile) return;
    const id = toast.loading("Saving profile…");
    try {
      await apiClient.put("/me", data);
      const updated = {
        ...profile,
        ...data,
        avatar: data.pfp ?? profile.avatar,
      };
      authService.updateUserInStorage(updated);
      setProfile(updated);
      toast.success("Profile updated successfully!", { id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      toast.error("Failed to update profile", { description: msg, id });
      throw err;
    }
  };

  return { profile, loading, error, save, setProfile };
}
