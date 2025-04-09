import React from "react";
import styles from "./AccountPage.module.css";

interface UserProfile {
  fullName: string;
  nickName: string;
  email: string;
  gender: string;
  country: string;
  language: string;
  timeZone: string;
  avatar?: string;
}

export const AccountPage: React.FC = () => {
  // This would typically come from your auth context or API
  const userProfile: UserProfile = {
    fullName: "Enrique Macias López",
    nickName: "Kike",
    email: "a0164l402@softtek.com",
    gender: "Male",
    country: "México",
    language: "English",
    timeZone: "Central Standard Time (CST) GMT-06:00",
    avatar: "https://i.pravatar.cc/150?img=3", // Replace with actual user avatar
  };

  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <div className={styles.accountView}>
      <div className={styles.accountCard}>
        <div className={styles.gradientHeader} />
        <div className={styles.cardContent}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarSection}>
              <img
                src={userProfile.avatar}
                alt={userProfile.fullName}
                className={styles.avatar}
              />
            </div>
            <div className={styles.profileInfo}>
              <h1>{userProfile.fullName}</h1>
              <span className={styles.email}>{userProfile.email}</span>
            </div>
            <button
              className={styles.editButton}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>

          <div className={styles.profileForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <div className={styles.inputField}>{userProfile.fullName}</div>
              </div>
              <div className={styles.formGroup}>
                <label>Nick Name</label>
                <div className={styles.inputField}>{userProfile.nickName}</div>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Gender</label>
                <div className={styles.inputField}>
                  <span>{userProfile.gender}</span>
                  <span className={styles.dropdownIcon}>▼</span>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Country</label>
                <div className={styles.inputField}>
                  <span>{userProfile.country}</span>
                  <span className={styles.dropdownIcon}>▼</span>
                </div>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Language</label>
                <div className={styles.inputField}>
                  <span>{userProfile.language}</span>
                  <span className={styles.dropdownIcon}>▼</span>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Time Zone</label>
                <div className={styles.inputField}>
                  <span>{userProfile.timeZone}</span>
                  <span className={styles.dropdownIcon}>▼</span>
                </div>
              </div>
            </div>

            <div className={styles.emailSection}>
              <h2>My email Address</h2>
              <div className={styles.emailItem}>
                <div className={styles.emailIcon}>
                  <svg
                    width="24"
                    height="24"
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
                </div>
                <div className={styles.emailDetails}>
                  <span className={styles.emailAddress}>
                    {userProfile.email}
                  </span>
                  <span className={styles.emailTimestamp}>1 month ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
