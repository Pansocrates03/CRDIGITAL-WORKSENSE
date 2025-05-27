// components/Settings/Tabs/UserManagementTab.tsx
import React, {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {AvatarDisplay} from "@/components/ui/AvatarDisplay";
import {MoreVertical, Pencil, Trash2, Users} from "lucide-react";
import {createPortal} from "react-dom";
import apiClient from "@/api/apiClient";
import styles from "../Settings.module.css";
import {CreateUserModal} from "../CreateUserModal";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/ui/deleteConfirmationModal/deleteConfirmationModal";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/UserType";

interface MenuPosition {
    top: number;
    left: number;
}

interface UserManagementTabProps {
    users: User[];
    usersLoading: boolean;
    usersError: boolean;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
    users,
    usersLoading,
    usersError,
}) => {
    const queryClient = useQueryClient()
    
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    const menuButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>(
        {}
    );
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

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

    const handleEditClick = (user: User) => {
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
        const {name, value} = e.target;
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
            toast.error("Email, first name, and last name are required");
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
                toast.success(`User ${formData.firstName} ${formData.lastName} updated successfully`);
                setIsEditModalOpen(false);
                setEditingUser(null);
                queryClient.invalidateQueries({ queryKey: ["users"]})
            } else {
                toast.error("Update succeeded but received an unexpected status.");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to update user";
            toast.error(errorMessage);
            console.error("Error updating user:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleModalClose = () => {
        setIsCreateModalOpen(false);
        // Only refetch and show success message when modal is closed
        queryClient.invalidateQueries({ queryKey: ["users"]})
    };

    const handleCreateUser = async (userData: any) => {
        try {
            const response = await apiClient.post("/users", userData);

            if (response.status >= 200 && response.status < 300) {
                toast.success(`User ${userData.firstName} ${userData.lastName} created successfully`);
            } else {
                toast.error("Creation succeeded but received an unexpected status.");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to create user";
            toast.error(errorMessage);
            console.error("Error creating user:", error);
            throw error; // Re-throw to let the modal handle the error state
        }
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
        setActiveMenuId(null);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            setIsUpdating(true);
            const response = await apiClient.delete(`/users/${userToDelete.id}`);

            if (response.status >= 200 && response.status < 300) {
                toast.success(`User ${userToDelete.firstName} ${userToDelete.lastName} deleted successfully`);
                setDeleteModalOpen(false);
                setUserToDelete(null);
                queryClient.invalidateQueries({ queryKey: ["users"]})
            } else {
                toast.error("Deletion succeeded but received an unexpected status.");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to delete user";
            toast.error(errorMessage);
            console.error("Error deleting user:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (usersLoading) {
        return <div className={styles.loadingContainer}/>
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
                        <Users className={styles.subtitleIcon}/>
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
                                            user={user}
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
                                        <MoreVertical className="h-4 w-4"/>
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
                                            <Pencil className="h-4 w-4"/>
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            className={styles.menuItem}
                                            onClick={() => handleDeleteClick(user)}
                                        >
                                            <Trash2 className={`h-4 w-4 ${styles.deleteIcon}`}/>
                                            <span className={styles.deleteIcon}>Delete</span>
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
                onClose={handleModalClose}
                onSubmit={handleCreateUser}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setUserToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}? This action cannot be undone.`}
            />
        </div>
    );
};
