// components/Settings/Settings.tsx
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Toaster} from "sonner";

import {AccountTab} from "./tabs/AccountTab";
import {UserManagementTab} from "./tabs/UserManagementTab";
import {useFetchUsers} from "./hooks";
import styles from "./Settings.module.css";
import {useAuth} from "@/contexts/AuthContext.tsx";

// --- Constants ---
const TAB_ACCOUNT = "account";
const TAB_USER_MANAGEMENT = "userManagement";
const PLATFORM_ROLE_ADMIN = "admin";

// --- Types ---
export type TabType = typeof TAB_ACCOUNT | typeof TAB_USER_MANAGEMENT;

interface TabConfig {
    key: TabType;
    label: string;
    group: string;
    adminOnly: boolean;
}

// --- Tab Configuration ---
// Move configuration outside component to prevent recreation on each render
const TABS_CONFIG: TabConfig[] = [
    {key: TAB_ACCOUNT, label: "Account", group: "General", adminOnly: false},
    {
        key: TAB_USER_MANAGEMENT,
        label: "User Management",
        group: "Admin",
        adminOnly: true,
    },
];

const Settings: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {user, loading: authLoading, isAuthenticated} = useAuth();

    // Memoize admin status check to prevent recalculations
    const isAdmin = useMemo(() =>
            isAuthenticated && user?.platformRole?.toLowerCase() === PLATFORM_ROLE_ADMIN,
        [user?.platformRole, isAuthenticated]
    );

    // Extract tab from URL once and then use it to initialize state
    const [activeTab, setActiveTab] = useState<TabType>(() => {
        const params = new URLSearchParams(location.search);
        const tabFromUrl = params.get("tab") as TabType;

        // Check if the tab is valid and accessible to the user
        if (tabFromUrl && TABS_CONFIG.some(t => t.key === tabFromUrl)) {
            const tabConfig = TABS_CONFIG.find(t => t.key === tabFromUrl);
            if (tabConfig && (!tabConfig.adminOnly || isAdmin)) {
                return tabFromUrl;
            }
        }
        return TAB_ACCOUNT;
    });

    // Get users data only if necessary
    const {users, usersLoading, usersError, refetchUsers} = useFetchUsers(
        activeTab === TAB_USER_MANAGEMENT && isAdmin ? activeTab : null,
        user?.platformRole
    );

    // Handle URL changes and permissions
    useEffect(() => {
        if (authLoading) return;

        const params = new URLSearchParams(location.search);
        const tabFromUrl = params.get("tab") as TabType;

        if (!tabFromUrl) {
            // No tab in URL, set to default
            if (activeTab !== TAB_ACCOUNT) {
                navigate(`/settings?tab=${TAB_ACCOUNT}`, {replace: true});
                setActiveTab(TAB_ACCOUNT);
            }
            return;
        }

        // Check if tab exists in config
        const tabConfig = TABS_CONFIG.find(t => t.key === tabFromUrl);
        if (!tabConfig) {
            navigate(`/settings?tab=${TAB_ACCOUNT}`, {replace: true});
            setActiveTab(TAB_ACCOUNT);
            return;
        }

        // Check permissions for admin tabs
        if (tabConfig.adminOnly && !isAdmin) {
            navigate(`/settings?tab=${TAB_ACCOUNT}`, {replace: true});
            setActiveTab(TAB_ACCOUNT);
            return;
        }

        // Only update state if needed
        if (activeTab !== tabFromUrl) {
            setActiveTab(tabFromUrl);
        }
    }, [location.search, navigate, isAdmin, activeTab, authLoading]);

    // Memoize tab change handler
    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
        navigate(`/settings?tab=${tab}`, {replace: true});
    }, [navigate]);

    // Memoize grouped tabs to prevent recalculation
    const groupedTabs = useMemo(() => {
        if (!isAuthenticated) return {};

        return TABS_CONFIG.reduce((acc, tab) => {
            if (tab.adminOnly && !isAdmin) {
                return acc;
            }

            if (!acc[tab.group]) {
                acc[tab.group] = [];
            }

            acc[tab.group].push(tab);
            return acc;
        }, {} as Record<string, TabConfig[]>);
    }, [isAdmin, isAuthenticated]);

    // Memoize tab content to prevent recreation on every render
    const tabContent = useMemo(() => {
        if (!isAuthenticated) return <p>Please log in to see account details.</p>;

        switch (activeTab) {
            case TAB_ACCOUNT:
                return <AccountTab/>;
            case TAB_USER_MANAGEMENT:
                if (isAdmin) {
                    return (
                        <UserManagementTab
                            users={users}
                            usersLoading={usersLoading}
                            usersError={usersError}
                            refetchUsers={refetchUsers}
                        />
                    );
                }
                return <p>You do not have permission to view user management.</p>;
            default:
                const knownTab = TABS_CONFIG.find(t => t.key === activeTab);
                if (knownTab?.adminOnly && !isAdmin) {
                    return <p>You do not have permission to view this admin section.</p>;
                }
                return null;
        }
    }, [activeTab, isAdmin, isAuthenticated, users, usersLoading, usersError, refetchUsers]);

    if (authLoading) {
        return (
            <div className={styles.settingsContainer}>
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className={styles.settingsContainer}>
            <Toaster position="bottom-right"/>

            {isAuthenticated && Object.keys(groupedTabs).length > 0 && (
                <div className={styles.tabNavigation}>
                    {Object.entries(groupedTabs).map(([groupName, tabsInGroup]) => (
                        <div key={groupName} className={styles.tabGroup}>
                            <div className={styles.tabGroupTitle}>{groupName}</div>
                            {tabsInGroup.map((tab) => (
                                <button
                                    key={tab.key}
                                    className={`${styles.tabButton} ${
                                        activeTab === tab.key ? styles.activeTab : ""
                                    }`}
                                    onClick={() => handleTabChange(tab.key)}
                                    aria-current={activeTab === tab.key ? "page" : undefined}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.contentArea}>
                {tabContent}
            </div>
        </div>
    );
};

export default Settings;