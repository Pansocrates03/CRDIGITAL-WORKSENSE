/* React and Router imports */
import React, { useState } from "react";
import { useParams } from "react-router-dom";

/* Custom hooks for sprint data management */
import { useSprints, useCreateSprint, useDeleteSprint, useUpdateSprint } from "@/hooks/useSprintData";
import { useAuth } from "@/hooks/useAuth";
import { useMembers } from "@/hooks/useMembers";

/* Types */
import { Sprint } from "@/types/SprintType";

/* UI Components */
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal/Modal";
import DeleteConfirmationModal from "@/components/ui/deleteConfirmationModal/deleteConfirmationModal";
import { toast } from "sonner";

/* Icons */
import { PlusIcon, Pencil, Trash2 } from "lucide-react";

/* Styles */
import "./SprintsPage.css";

const SprintsPage: React.FC = () => {
    // Get project ID from URL parameters
    const { id: projectId } = useParams<{ id: string }>();
    
    // Get current user and members data
    const { data: user } = useAuth();
    const { data: members = [] } = useMembers(projectId ?? "");
    
    // Check if user has management permissions
    const canManageSprints = members.some(
        member => 
            member.userId === user?.userId && 
            (member.projectRoleId === 'product-owner' || member.projectRoleId === 'scrum-master')
    );
    
    // Fetch sprints data using custom hook
    const { data: sprints, isLoading, error } = useSprints(projectId ?? "");
    
    // Initialize mutation hooks
    const createSprintMutation = useCreateSprint(projectId ?? "");
    const deleteSprintMutation = useDeleteSprint(projectId ?? "");
    const updateSprintMutation = useUpdateSprint(projectId ?? "");
    
    // State for controlling modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // State for managing form data
    const [newSprint, setNewSprint] = useState({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        status: "Planned" as "Planned" | "Active" | "Completed"
    });

    // State to track if we're editing
    const [isEditing, setIsEditing] = useState(false);
    const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

    // State for delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sprintToDelete, setSprintToDelete] = useState<string | null>(null);

    /* ===== Form Management Functions ===== */

    // Resets the form fields to their initial empty values and clears the editing state
    const resetForm = () => {
        setNewSprint({
            name: "",
            goal: "",
            startDate: "",
            endDate: "",
            status: "Planned"
        });
        setIsEditing(false);
        setEditingSprint(null);
    };

    // Handles closing the modal and resetting the form
    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    /* ===== Date Formatting Functions ===== */

    // Formats a Firestore timestamp into a readable date string
    const formatDate = (timestamp: any) => {
        if (!timestamp || !timestamp._seconds) return "N/A";
        const date = new Date(timestamp._seconds * 1000);
        return date.toLocaleDateString();
    };

    // Formats a date for API submission in YYYY-MM-DD format
    const formatDateForAPI = (date: string | Date) => {
        if (!date) return "";
        if (typeof date === 'string') {
            return date;
        }
        return date.toISOString().split("T")[0];
    };

    // Converts a Firestore timestamp to a JavaScript Date object
    const convertTimestampToDate = (timestamp: any): Date | null => {
        if (!timestamp || !timestamp._seconds) return null;
        return new Date(timestamp._seconds * 1000);
    };

    /* ===== Event Handler Functions ===== */

    // Handles changes to form input fields and validates date fields
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // If changing start date, validate against end date
        if (name === 'startDate' && newSprint.endDate) {
            const newStartDate = new Date(value);
            const endDate = new Date(newSprint.endDate);
            if (newStartDate > endDate) {
                toast.error("Start date cannot be after end date");
                return;
            }
        }
        
        // If changing end date, validate against start date
        if (name === 'endDate' && newSprint.startDate) {
            const startDate = new Date(newSprint.startDate);
            const newEndDate = new Date(value);
            if (newEndDate < startDate) {
                toast.error("End date cannot be before start date");
                return;
            }
        }

        setNewSprint(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Sets up the form with the sprint's current data for editing
    const handleEditSprint = (sprint: Sprint) => {
        setEditingSprint(sprint);
        setNewSprint({
            name: sprint.name,
            goal: sprint.goal || "",
            startDate: sprint.startDate ? formatDateForAPI(convertTimestampToDate(sprint.startDate) || new Date()) : "",
            endDate: sprint.endDate ? formatDateForAPI(convertTimestampToDate(sprint.endDate) || new Date()) : "",
            status: sprint.status || "Planned"
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // Handles form submission for creating or updating a sprint with validation
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate dates
        const startDate = new Date(newSprint.startDate);
        const endDate = new Date(newSprint.endDate);
        
        if (endDate < startDate) {
            toast.error("End date cannot be before start date");
            return;
        }

        // Check if trying to set a sprint as active when another is already active
        if (newSprint.status === "Active") {
            const hasActiveSprint = sprints?.some(
                sprint => sprint.status === "Active" && (!isEditing || sprint.id !== editingSprint?.id)
            );
            
            if (hasActiveSprint) {
                toast.error("There can only be one active sprint at a time. Please complete or cancel the current active sprint first.");
                return;
            }
        }

        try {
            if (isEditing && editingSprint) {
                await updateSprintMutation.mutateAsync({
                    id: editingSprint.id,
                    name: newSprint.name,
                    goal: newSprint.goal,
                    startDate: formatDateForAPI(startDate),
                    endDate: formatDateForAPI(endDate),
                    status: newSprint.status
                });

                toast.success("Sprint updated successfully!");
            } else {
                await createSprintMutation.mutateAsync({
                    name: newSprint.name,
                    status: "Planned", // New sprints always start as Planned
                    goal: newSprint.goal,
                    startDate: formatDateForAPI(startDate),
                    endDate: formatDateForAPI(endDate),
                });

                toast.success("Sprint created successfully!");
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save sprint:", error);
            toast.error("Error saving sprint!");
        }
    };

    // Opens the confirmation modal for sprint deletion
    const handleDeleteSprint = async (sprintId: string) => {
        setSprintToDelete(sprintId);
        setIsDeleteModalOpen(true);
    };

    // Executes the sprint deletion after confirmation
    const handleConfirmDelete = async () => {
        if (sprintToDelete) {
            try {
                await deleteSprintMutation.mutateAsync(sprintToDelete);
                setSprintToDelete(null);
                toast.success("Sprint deleted successfully!");
            } catch (error) {
                console.error("Failed to delete sprint:", error);
                toast.error("Failed to delete sprint!");
            }
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="sprints-page">
                <div className="sprints-page__loading">
                    <div className="loading-spinner"></div>
                    <p>Loading sprints...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="sprints-page">
                <div className="sprints-page__error">
                    <p>Error loading sprints: {error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 pt-3">
            <div className="sprints-page">
                {/* Header section */}
                <div className="flex items-baseline justify-between w-full">
                    <div className="sprints-page__header">
                        <h1>Sprints</h1>
                        <p>Manage your project sprints</p>
                    </div>
                    {canManageSprints && (
                        <Button
                            variant="default"
                            size="default"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <PlusIcon className="mr-1 h-4 w-4" />
                            Create Sprint
                        </Button>
                    )}
                </div>

                <div className="sprints-page__divider" />

                {/* Main content section */}
                <div className="sprints-list">
                    {sprints && sprints.length > 0 ? (
                        <div className="space-y-2">
                            {sprints.map((sprint: Sprint) => (
                                <div key={sprint.id} className="sprint-item">
                                    <div 
                                        className="sprint-header"
                                        onClick={() => {
                                            const element = document.getElementById(`sprint-${sprint.id}`);
                                            if (element) {
                                                element.classList.toggle('hidden');
                                            }
                                        }}
                                    >
                                        <div className="sprint-header__content">
                                            <h3 className="sprint-header__title">{sprint.name}</h3>
                                            <span className={`status-badge status-badge--${sprint.status?.toLowerCase()}`}>
                                                {sprint.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div 
                                        id={`sprint-${sprint.id}`}
                                        className="sprint-details hidden"
                                    >
                                        <div className="sprint-details__content">
                                            <div className="sprint-details__section">
                                                <h4>Goal</h4>
                                                <p>{sprint.goal || 'No goal defined'}</p>
                                            </div>
                                            <div className="sprint-details__section">
                                                <h4>Dates</h4>
                                                <p>
                                                    {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                                                </p>
                                            </div>
                                        </div>
                                        {canManageSprints && (
                                            <div className="sprint-details__actions">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditSprint(sprint);
                                                    }}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span>Edit Sprint</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSprint(sprint.id);
                                                    }}
                                                    className="flex items-center space-x-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>Delete Sprint</span>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="sprints-page__empty">
                            <p>No sprints found. {canManageSprints ? "Create your first sprint to get started!" : "No sprints have been created yet."}</p>
                        </div>
                    )}
                </div>

                {/* Create/Edit Sprint Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={isEditing ? "Edit Sprint" : "Create New Sprint"}
                    size="m"
                >
                    <form onSubmit={handleSubmit} className="sprint-form">
                        <div className="space-y-4">
                            <div className="sprint-form__section">
                                <label htmlFor="name" className="sprint-form__label">
                                    Sprint Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newSprint.name}
                                    onChange={handleInputChange}
                                    className="sprint-form__input"
                                    placeholder="Enter sprint name"
                                    required
                                />
                            </div>
                            <div className="sprint-form__section">
                                <label htmlFor="goal" className="sprint-form__label">
                                    Sprint Goal
                                </label>
                                <textarea
                                    id="goal"
                                    name="goal"
                                    value={newSprint.goal}
                                    onChange={handleInputChange}
                                    className="sprint-form__textarea"
                                    placeholder="Enter sprint goal"
                                    rows={3}
                                />
                            </div>
                            {isEditing && (
                                <div className="sprint-form__section">
                                    <label htmlFor="status" className="sprint-form__label">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={newSprint.status}
                                        onChange={handleInputChange}
                                        className="sprint-form__input"
                                    >
                                        <option value="Planned">Planned</option>
                                        <option
                                            value="Active"
                                            disabled={sprints?.some(s => s.status === "Active" && s.id !== editingSprint?.id)}
                                        >
                                            Active {sprints?.some(s => s.status === "Active" && s.id !== editingSprint?.id) ? "(Another sprint is active)" : ""}
                                        </option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            )}
                            <div className="sprint-form__section">
                                <label htmlFor="startDate" className="sprint-form__label">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={newSprint.startDate}
                                    onChange={handleInputChange}
                                    className="sprint-form__input"
                                    required
                                />
                            </div>
                            <div className="sprint-form__section">
                                <label htmlFor="endDate" className="sprint-form__label">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={newSprint.endDate}
                                    onChange={handleInputChange}
                                    className="sprint-form__input"
                                    required
                                />
                            </div>
                        </div>
                        <div className="sprint-form__actions">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {isEditing ? 'Update Sprint' : 'Create Sprint'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSprintToDelete(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    title="Delete Sprint"
                    message="Are you sure you want to delete this sprint? This action cannot be undone."
                />
            </div>
        </div>
    );
};

export default SprintsPage;
