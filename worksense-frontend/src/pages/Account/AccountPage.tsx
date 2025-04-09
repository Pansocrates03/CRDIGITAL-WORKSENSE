import React, { useState, useEffect } from "react";
import styles from "./AccountPage.module.css";

// Import the User interface
export interface User {
  email: string;
  userId: number;
  firstName?: string;
  lastName?: string;
  gender?: string;
  fullName?: string;
}

// Extended user profile with additional fields
interface UserProfile extends User {
  nickName?: string;
  country?: string;
  language?: string;
  timeZone?: string;
  avatar?: string;
}

export const AccountPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user data from localStorage on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Get user data from localStorage
        const userData = localStorage.getItem("user");

        if (!userData) {
          throw new Error("User data not found in localStorage");
        }

        const user: User = JSON.parse(userData);

        // Create profile by extending the User data with defaults for missing fields
        const profile: UserProfile = {
          ...user,
          nickName: user.firstName ? user.firstName.substring(0, 4) : "User",
          country: "México",
          language: "English",
          timeZone: "Central Standard Time (CST) GMT-06:00",
          // Generate avatar from API if not provided
          // For a specific color (like your brand color)
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.fullName ||
              `${user.firstName || ""} ${user.lastName || ""}` ||
              user.email
          )}&background=AC1754&color=FFFFFF`,
        };

        setUserProfile(profile);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load user data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = () => {
    // In a real app, this would send updated data to the server
    // For now we just toggle out of edit mode
    setIsEditing(false);
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

  // Formatted display name
  const displayName =
    userProfile.fullName ||
    `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() ||
    userProfile.email.split("@")[0];

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <h1>My Account</h1>
        <button
          className={`${styles.actionButton} ${
            isEditing ? styles.saveButton : ""
          }`}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileBasics}>
          <div className={styles.avatarContainer}>
            <img
              src={userProfile.avatar}
              alt={displayName}
              className={styles.avatar}
            />
          </div>
          <div className={styles.userDetails}>
            {isEditing ? (
              <input
                type="text"
                className={styles.nameInput}
                value={displayName}
                onChange={(e) => {
                  setUserProfile({
                    ...userProfile,
                    fullName: e.target.value,
                  });
                }}
                placeholder="Your name"
              />
            ) : (
              <h2 className={styles.userName}>{displayName}</h2>
            )}
            <div className={styles.userEmail}>
              <svg
                className={styles.emailIcon}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 6L12 13L2 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {userProfile.email}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Personal Information</h3>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="nickname">Nickname</label>
              {isEditing ? (
                <input
                  id="nickname"
                  type="text"
                  value={userProfile.nickName || ""}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, nickName: e.target.value })
                  }
                  placeholder="Your nickname"
                />
              ) : (
                <div className={styles.fieldValue}>
                  {userProfile.nickName || "-"}
                </div>
              )}
            </div>

            <div className={styles.formField}>
              <label htmlFor="gender">Gender</label>
              {isEditing ? (
                <select
                  id="gender"
                  value={userProfile.gender || ""}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <div className={styles.fieldValue}>
                  {userProfile.gender || "-"}
                </div>
              )}
            </div>

            <div className={styles.formField}>
              <label htmlFor="country">Country</label>
              {isEditing ? (
                <select
                  id="country"
                  value={userProfile.country || ""}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, country: e.target.value })
                  }
                >
                  <option value="">Select Country</option>
                  <option value="México">México</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                </select>
              ) : (
                <div className={styles.fieldValue}>
                  {userProfile.country || "-"}
                </div>
              )}
            </div>

            <div className={styles.formField}>
              <label htmlFor="language">Language</label>
              {isEditing ? (
                <select
                  id="language"
                  value={userProfile.language || ""}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, language: e.target.value })
                  }
                >
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                </select>
              ) : (
                <div className={styles.fieldValue}>
                  {userProfile.language || "-"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Preferences</h3>

          <div className={styles.formField}>
            <label htmlFor="timezone">Time Zone</label>
            {isEditing ? (
              <select
                id="timezone"
                value={userProfile.timeZone || ""}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, timeZone: e.target.value })
                }
              >
                <option value="">Select Time Zone</option>
                <option value="Central Standard Time (CST) GMT-06:00">
                  Central Standard Time (CST) GMT-06:00
                </option>
                <option value="Eastern Standard Time (EST) GMT-05:00">
                  Eastern Standard Time (EST) GMT-05:00
                </option>
                <option value="Pacific Standard Time (PST) GMT-08:00">
                  Pacific Standard Time (PST) GMT-08:00
                </option>
              </select>
            ) : (
              <div className={styles.fieldValue}>
                {userProfile.timeZone || "-"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
