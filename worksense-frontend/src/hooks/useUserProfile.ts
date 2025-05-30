import { useEffect, useState } from "react";
import { User } from "@/types/UserType"; // Ensure this path is correct
import { authService } from "@/services/auth"; // Ensure this path is correct
import apiClient from "@/api/apiClient"; // Import your apiClient
import { endpoints } from "@/lib/constants/endpoints"; // Import your endpoints

export interface UserProfile extends User {
    avatar: string; // This is a client-side enhanced property
}

// Helper to determine if an error is an AxiosError with response data
// This can be more specific if you have a standard error response shape
interface ApiErrorData {
    message?: string;
    // Add other common error properties from your API if available
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isApiError(error: any): error is import('axios').AxiosError<ApiErrorData> {
    return error.isAxiosError && error.response && error.response.data;
}


export function useUserProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null); // Reset error on new load attempt

            // Use apiClient to fetch profile data
            // Assuming endpoints.getProfile() returns the URL path for the profile
            const response = await apiClient.get<User>(endpoints.getProfile());
            const userData = response.data; // Axios response.data is already parsed

            const avatar =
                userData.pfp ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userData.fullName || userData.email
                )}&background=AC1754&color=FFFFFF`;

            const profileData: UserProfile = { ...userData, avatar };
            setProfile(profileData);

            // Update local storage with latest data (raw from server)
            authService.updateUserInStorage(userData);
        } catch (err) {
            let msg = "Failed to load profile";
            if (isApiError(err) && err.response?.data?.message) {
                msg = err.response.data.message;
            } else if (err instanceof Error) {
                msg = err.message;
            }
            console.error("Error loading profile:", err);
            setError(msg);
            // The apiClient interceptor will handle 401s (logout and redirect)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const save = async (dataToUpdate: { nickName?: string; pfp?: string }) => {
        if (!profile) {
            throw new Error("Profile not loaded, cannot save.");
        }
        try {
            setLoading(true); // Optional: set loading during save
            setError(null);   // Reset error

            // Use apiClient to update profile data
            // Assuming endpoints.updateProfile() returns the URL path for updating
            // Using PUT, adjust to PATCH if your API uses it for partial updates
            const response = await apiClient.put<User>(endpoints.updateProfile(), dataToUpdate);
            const updatedUser = response.data; // Axios response.data is already parsed

            // Construct the updated profile with the new avatar logic
            const updatedProfileData: UserProfile = {
                ...updatedUser,
                avatar: dataToUpdate.pfp ?? profile.avatar, // Use new pfp if provided, else old avatar
            };

            // If pfp was not in dataToUpdate but updatedUser.pfp changed (e.g. server generated),
            // you might want to re-evaluate the avatar source:
            // const newAvatarSource = dataToUpdate.pfp || updatedUser.pfp || profile.avatar (or the default generator)

            setProfile(updatedProfileData);

            // Update local storage with the data that reflects the current profile state
            // If authService.updateUserInStorage expects only raw User data:
            // authService.updateUserInStorage(updatedUser);
            // If it can handle/expects UserProfile (with client-side avatar):
            authService.updateUserInStorage(updatedProfileData); // Assuming it handles UserProfile or picks relevant fields

            return updatedProfileData; // Return the updated profile
        } catch (err) {
            let msg = "Failed to save profile";
            if (isApiError(err) && err.response?.data?.message) {
                msg = err.response.data.message;
            } else if (err instanceof Error) {
                msg = err.message;
            }
            console.error("Error saving profile:", err);
            setError(msg);
            // The apiClient interceptor will handle 401s
            throw new Error(msg); // Re-throw the error to be caught by the caller if needed
        } finally {
            setLoading(false); // Optional: reset loading
        }
    };

    return {
        profile,
        loading,
        error,
        save,
        setProfile, // Exposing setProfile directly can be useful for optimistic updates
        refresh: loadProfile
    };
}