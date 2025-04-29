// components/Settings/hooks.ts
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/api/apiClient";
import { UserListItem } from "./interfaces";

export const useFetchUsers = (
  activeTab: string,
  platformRole: string | undefined
) => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (activeTab === "userManagement" && platformRole === "admin") {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const response = await apiClient.get("/users");
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsersError("Failed to load users. Please try again.");
      } finally {
        setUsersLoading(false);
      }
    }
  }, [activeTab, platformRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, usersLoading, usersError, refetchUsers: fetchUsers };
};
