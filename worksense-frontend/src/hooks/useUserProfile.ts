import {useEffect, useState} from "react";
import { User } from "@/types/UserType";
import { userProfileService } from "@/services/userProfileService";
import { authService } from "@/services/auth";

export interface UserProfile extends User {
    avatar: string;
}

export function useUserProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const userData = await userProfileService.fetchProfile();
            const avatar =
                userData.pfp ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userData.fullName || userData.email
                )}&background=AC1754&color=FFFFFF`;

            const profileData = {...userData, avatar};
            setProfile(profileData);

            // Update local storage with latest data
            authService.updateUserInStorage(userData);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to load profile";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const save = async (data: { nickName?: string; pfp?: string }) => {
        if (!profile) return;
        try {
            const updatedUser = await userProfileService.updateProfile(data);
            const updated = {
                ...updatedUser,
                avatar: data.pfp ?? profile.avatar,
            };
            authService.updateUserInStorage(updated);
            setProfile(updated);
        } catch (err) {
            throw err;
        }
    };

    return {profile, loading, error, save, setProfile, refresh: loadProfile};
}
