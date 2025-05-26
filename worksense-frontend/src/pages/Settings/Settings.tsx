// components/Settings/Settings.tsx
import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {AccountTab} from "./tabs/AccountTab";
import {UserManagementTab} from "./tabs/UserManagementTab";
import {useFetchUsers} from "./hooks";
import {TabType} from "./interfaces";
import styles from "./Settings.module.css";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";

const Settings: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>("account");
    const { user } = useAuth();
    const { data:users, isLoading:usersLoading, isError:usersError } = useUsers();

    // Check if user is admin (case-insensitive)
    const isAdmin = user?.platformRole?.toLowerCase() === "admin";

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab") as TabType;
        if (tab) setActiveTab(tab);
    }, [location.search]);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        navigate(`/settings?tab=${tab}`, {replace: true});
    };

    return (
        <div className={styles.settingsContainer}>
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
                {"account" === activeTab ? (
                    <AccountTab userId={user?.id}/>
                ) : activeTab === "userManagement" && isAdmin ? (
                    <UserManagementTab
                        users={users}
                        usersLoading={usersLoading}
                        usersError={usersError}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default Settings;

