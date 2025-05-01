// components/Settings/Settings.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AccountTab } from "./tabs/AccountTab";
import { UserManagementTab } from "./tabs/UserManagementTab";
import { useFetchUsers } from "./hooks";
import { TabType } from "./interfaces";
import styles from "./Settings.module.css";
import { authService } from "@/services/auth";

const Settings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const [user, setUser] = useState(authService.getCurrentUser());
  const { users, usersLoading, usersError, refetchUsers } = useFetchUsers(
    activeTab,
    user?.platformRole
  );

  // Check if user is admin (case-insensitive)
  const isAdmin = user?.platformRole?.toLowerCase() === "admin";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") as TabType;
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    navigate(`/settings?tab=${tab}`, { replace: true });
  };

  return (
    <div className={styles.settingsContainer}>
      <Toaster position="bottom-right" />

      {/* Vertical Tab Navigation */}
      <div className={styles.tabNavigation}>
        <div className={styles.tabGroup}>
          <div className={styles.tabGroupTitle}>General</div>
          <button
            className={`${styles.tabButton} ${
              activeTab === "account" ? styles.activeTab : ""
            }`}
            onClick={() => handleTabChange("account")}
          >
            Account
          </button>
        </div>

        {isAdmin && (
          <div className={styles.tabGroup}>
            <div className={styles.tabGroupTitle}>Admin</div>
            <button
              className={`${styles.tabButton} ${
                activeTab === "userManagement" ? styles.activeTab : ""
              }`}
              onClick={() => handleTabChange("userManagement")}
            >
              User Management
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        {activeTab === "account" ? (
          <AccountTab />
        ) : activeTab === "userManagement" && isAdmin ? (
          <UserManagementTab
            users={users}
            usersLoading={usersLoading}
            usersError={usersError}
            refetchUsers={refetchUsers}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Settings;
