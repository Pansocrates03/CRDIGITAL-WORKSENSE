// components/Settings/Tabs/UserManagementTab.tsx
import React, { useState, useRef, useEffect } from "react";
import { UserListItem } from "../interfaces";
import { Button } from "@/components/ui/button";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";
import { Pencil, Users, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import apiClient from "@/api/apiClient";
import styles from "../Settings.module.css";
import { CreateUserModal } from "../CreateUserModal";
import BacklogAlerts from "@/components/BacklogTable/BacklogAlerts";

interface MenuPosition {
  top: number;
  left: number;
}

interface UserManagementTabProps {
  users: UserListItem[];
  usersLoading: boolean;
  usersError: string | null;
  refetchUsers: () => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  usersLoading,
  usersError,
  refetchUsers,
}) => {
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<Partial<UserListItem>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const menuButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>(
    {}
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuPosition || !activeMenuId) return;

      const menuElement = document.querySelector(
        `[data-menu-id="${activeMenuId}"]`
      );
      if (
        menuElement &&
        !menuElement.contains(event.target as Node) &&
        !menuButtonRefs.current[activeMenuId]?.contains(event.target as Node)
      ) {
        setActiveMenuId(null);
        setMenuPosition(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuId, menuPosition]);

  const handleMenuClick = (userId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const button = menuButtonRefs.current[userId];
    if (!button) return;

    const rect = button.getBoundingClientRect();
    if (activeMenuId === userId) {
      setActiveMenuId(null);
      setMenuPosition(null);
    } else {
      setActiveMenuId(userId);
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 150,
      });
    }
  };

  const setMenuButtonRef = (el: HTMLButtonElement | null, userId: number) => {
    if (el) {
      menuButtonRefs.current[userId] = el;
    } else {
      delete menuButtonRefs.current[userId];
    }
  };

  const handleEditClick = (user: UserListItem) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      platformRole: user.platformRole,
      nickName: user.nickName || "",
      pfp: user.pfp || "",
    });
    setIsEditModalOpen(true);
    setActiveMenuId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async () => {
    if (
      !editingUser ||
      !formData.email ||
      !formData.firstName ||
      !formData.lastName
    ) {
      setErrorMessage("Email, first name, and last name are required");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    try {
      setIsUpdating(true);
      const updateData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        nickName: formData.nickName ?? null,
        pfp: formData.pfp ?? null,
        platformRole: formData.platformRole,
      };

      const response = await apiClient.put(
        `/users/${editingUser.id}`,
        updateData
      );

      if (response.status >= 200 && response.status < 300) {
        setSuccessMessage(
          `User ${formData.firstName} ${formData.lastName} updated successfully`
        );
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setIsEditModalOpen(false);
        setEditingUser(null);
        refetchUsers();
      } else {
        setErrorMessage("Update succeeded but received an unexpected status.");
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update user";
      setErrorMessage(errorMessage);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      console.error("Error updating user:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await apiClient.post("/users", userData);

      if (response.status >= 200 && response.status < 300) {
        setSuccessMessage(
          `User ${userData.firstName} ${userData.lastName} created successfully`
        );
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        refetchUsers();
        setIsCreateModalOpen(false);
      } else {
        setErrorMessage(
          "Creation succeeded but received an unexpected status."
        );
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create user";
      setErrorMessage(errorMessage);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      console.error("Error creating user:", error);
      throw error; // Re-throw to let the modal handle the error state
    }
  };

  if (usersLoading) {
    return <div className={styles.loadingContainer}>Loading users...</div>;
  }

  if (usersError) {
    return <div className={styles.errorMessage}>{usersError}</div>;
  }

  return (
    <div className={styles.userManagementContainer}>
      <BacklogAlerts
        successMessage={showSuccess ? successMessage : undefined}
        errorMessage={showError ? errorMessage : undefined}
      />
      <div className={styles.userManagementHeader}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>User Management</h2>
          <div className={styles.subtitle}>
            <Users className={styles.subtitleIcon} />
            <span>{users.length} Active Users</span>
          </div>
        </div>
        <Button variant="default" onClick={() => setIsCreateModalOpen(true)}>
          Add User
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatarWrapper}>
                      <AvatarDisplay
                        user={{
                          name: `${user.firstName} ${user.lastName}`,
                          profilePicture: user.pfp,
                        }}
                        size="sm"
                      />
                    </div>
                    <span className={styles.userName}>
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      styles[user.platformRole.toLowerCase()]
                    }`}
                  >
                    {user.platformRole}
                  </span>
                </td>
                <td>
                  <div className={styles.actionMenuContainer}>
                    <button
                      ref={(el) => setMenuButtonRef(el, user.id)}
                      className={styles.menuButton}
                      onClick={(e) => handleMenuClick(user.id, e)}
                      aria-label="Open menu"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Render menu in portal */}
      {activeMenuId &&
        menuPosition &&
        createPortal(
          <div
            className={styles.actionMenu}
            style={{
              position: "absolute",
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
            data-menu-id={activeMenuId}
          >
            {users.map(
              (user) =>
                user.id === activeMenuId && (
                  <React.Fragment key={user.id}>
                    <button
                      className={styles.menuItem}
                      onClick={() => handleEditClick(user)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </React.Fragment>
                )
            )}
          </div>,
          document.body
        )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit User</h3>
              <button
                className={styles.closeButton}
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdating}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label className={styles.label}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className={styles.input}
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isUpdating}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className={styles.input}
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isUpdating}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={editingUser.email}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Role</label>
                <select
                  name="platformRole"
                  className={styles.input}
                  value={formData.platformRole}
                  onChange={handleInputChange}
                  disabled={isUpdating}
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                className={styles.createButton}
                onClick={handleEditSubmit}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
};
