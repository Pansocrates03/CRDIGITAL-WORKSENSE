// components/Settings/Tabs/UserManagementTab.tsx
import React, { useState, useRef, useEffect } from "react";
import { UserListItem } from "../interfaces";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash2, Users, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import apiClient from "@/api/apiClient";
import styles from "../Settings.module.css";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<Partial<UserListItem>>({});
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
        left: rect.right - 150, // Menu width is 150px
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

  const handleDeleteClick = (user: UserListItem) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const handleEditSubmit = async () => {
    if (
      !editingUser ||
      !formData.email ||
      !formData.firstName ||
      !formData.lastName
    ) {
      toast.error("Email, first name, and last name are required");
      return;
    }

    try {
      setIsUpdating(true);
      // Only send the data expected by the backend controller for the SP call
      const updateData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        nickName: formData.nickName ?? null, // Send null if empty/undefined
        pfp: formData.pfp ?? null, // Send null if empty/undefined
        // platformRole is managed separately if needed, but not sent to spUpdateUser via this controller
      };

      console.log("Sending update data:", updateData);

      const response = await apiClient.put(
        `/users/${editingUser.id}`,
        updateData
      );

      console.log("API Response:", response);

      // Check for successful status codes (e.g., 200 OK, 204 No Content)
      if (response.status >= 200 && response.status < 300) {
        toast.success(
          `User ${formData.firstName} ${formData.lastName} updated successfully`
        );
        setIsEditModalOpen(false);
        setEditingUser(null);
        refetchUsers(); // Refresh the users list
      } else {
        // Handle unexpected successful status codes if necessary
        console.warn("Update successful but status code was:", response.status);
        toast.error("Update succeeded but received an unexpected status.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update user";
      toast.error(errorMessage);
      console.error("Error updating user:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const response = await apiClient.delete(`/users/${userToDelete.id}`);

      // Close modal and clear state first
      setIsDeleteModalOpen(false);
      setUserToDelete(null);

      // Small delay to ensure state is updated before showing toast
      setTimeout(() => {
        if (response.status === 200) {
          toast.success(
            `User ${userToDelete.firstName} ${userToDelete.lastName} deleted successfully`
          );
          refetchUsers(); // Refresh the users list after successful deletion
        }
      }, 100);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete user";
      toast.error(errorMessage);
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
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
      <div className={styles.userManagementHeader}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>User Management</h2>
          <div className={styles.subtitle}>
            <Users className={styles.subtitleIcon} />
            <span>{users.length} Active Users</span>
          </div>
        </div>
        <Button className={styles.submitButton}>Add User</Button>
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
                      <Avatar className={styles.userAvatar}>
                        <AvatarImage
                          src={user.pfp}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback>
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
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
                    <button
                      className={`${styles.menuItem} ${styles.deleteMenuItem}`}
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
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
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Delete User</h3>
              <button
                className={styles.closeButton}
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <p className={styles.deleteWarning}>
                Are you sure you want to delete {userToDelete.firstName}{" "}
                {userToDelete.lastName}?
              </p>
              <p className={styles.deleteSubtext}>
                This action cannot be undone. The user will lose access to their
                account immediately.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className={`${styles.createButton} ${styles.deleteButton}`}
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
