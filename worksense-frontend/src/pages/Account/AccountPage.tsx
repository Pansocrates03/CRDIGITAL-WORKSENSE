import React, { useState, useEffect } from "react";
import styles from "./AccountPage.module.css";
import { User } from "@/types/UserType";
import { authService } from "@/services/auth";
import apiClient from "@/api/apiClient";

// Define UserProfile interface that extends User
interface UserProfile extends User {
  avatar: string;
}

export const AccountPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>("");

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user data from localStorage
        const userData = localStorage.getItem("user");
        if (!userData) {
          throw new Error("User data not found");
        }

        // Parse user data
        const user: User = JSON.parse(userData);

        // Create user profile
        const profile: UserProfile = {
          ...user,
          avatar:
            user.pfp ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.fullName || user.email
            )}&background=AC1754&color=FFFFFF`,
        };

        setUserProfile(profile);
        setNewAvatarUrl(profile.avatar);
      } catch (err) {
        console.error("Error loading user data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load user data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Handle nickname change
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userProfile) return;
    setUserProfile({
      ...userProfile,
      nickName: e.target.value,
    });
  };

  // Handle avatar URL change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAvatarUrl(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      setIsLoading(true);
      setError(null);
      setSaveSuccess(false);

      // Get auth token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Prepare data for API
      const updateData: Record<string, any> = {
        nickName: userProfile.nickName || "",
        pfp: newAvatarUrl,
      };

      // Send update request
      await apiClient.put("/me", updateData);

      // Update local storage with new data
      const updatedProfile = {
        ...userProfile,
        pfp: newAvatarUrl,
        avatar: newAvatarUrl,
      };

      authService.updateUserInStorage(updatedProfile);
      setUserProfile(updatedProfile);

      setSaveSuccess(true);
      setIsEditing(false);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  // Error state
  if (error || !userProfile) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>!</div>
        <h2>Failed to load profile</h2>
        <p>{error || "User profile not found"}</p>
        <button
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Account</h1>
        {!isEditing && (
          <button
            className={styles.editButton}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className={styles.successMessage}>
          Profile updated successfully!
        </div>
      )}

      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <img
            src={isEditing ? newAvatarUrl : userProfile.avatar}
            alt="Profile"
            className={styles.avatar}
          />
          <h2>{userProfile.fullName || userProfile.email}</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Editable fields */}
          <div className={styles.formGroup}>
            <label htmlFor="nickName">Nickname</label>
            <input
              type="text"
              id="nickName"
              name="nickName"
              value={userProfile.nickName || ""}
              onChange={handleNicknameChange}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className={styles.formGroup}>
              <label htmlFor="avatar">Profile Picture URL</label>
              <input
                type="text"
                id="avatar"
                name="avatar"
                value={newAvatarUrl}
                onChange={handleAvatarChange}
                placeholder="Enter image URL"
              />
            </div>
          )}

          {/* Read-only fields */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={userProfile.email}
              disabled
              className={styles.readOnlyField}
            />
          </div>

          {isEditing && (
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setIsEditing(false);
                  setNewAvatarUrl(userProfile.avatar);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AccountPage;
