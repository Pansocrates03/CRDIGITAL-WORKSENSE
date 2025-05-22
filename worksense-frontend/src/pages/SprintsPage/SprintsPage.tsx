/* React and Router imports */
import React, { useState } from "react";
import { useParams } from "react-router-dom";

/* Custom hooks for sprint data management */
import { useSprints, useCreateSprint, useDeleteSprint, useUpdateSprint } from "@/hooks/useSprintData";

/* Types */
import { Sprint } from "@/types/SprintType";

/* UI Components */
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal/Modal";
import DeleteConfirmationModal from "@/components/ui/deleteConfirmationModal/deleteConfirmationModal";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";

/* Icons */
import { PlusIcon, Pencil, Trash2 } from "lucide-react";

/* Styles */
import "./SprintsPage.css";

const SprintsPage: React.FC = () => {
    // Get project ID from URL parameters
    const { id: projectId } = useParams<{ id: string }>();
    
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

    // Mock user role - Replace this with actual user role check
    const userRole = "product-owner"; // This should come from your auth context

    // Check if user has edit permissions
    const canEdit = userRole === "product-owner" || userRole === "scrum-master";

    // State for delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sprintToDelete, setSprintToDelete] = useState<string | null>(null);

    // Function to reset form fields to empty values
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

    // Function to handle modal closing and form reset
    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    // Format date for display in the table (converts Firestore timestamp to readable date)
    const formatDate = (timestamp: any) => {
        if (!timestamp || !timestamp._seconds) return "N/A";
        const date = new Date(timestamp._seconds * 1000);
        return date.toLocaleDateString();
    };

    // Format date for API in YYYY-MM-DD format
    const formatDateForAPI = (date: string | Date) => {
        if (!date) return "";
        if (typeof date === 'string') {
            return date;
        }
        return date.toISOString().split("T")[0];
    };

    // Convert Firestore timestamp to Date object
    const convertTimestampToDate = (timestamp: any): Date | null => {
        if (!timestamp || !timestamp._seconds) return null;
        return new Date(timestamp._seconds * 1000);
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // If changing start date, validate against end date
        if (name === 'startDate' && newSprint.endDate) {
            const newStartDate = new Date(value);
            const endDate = new Date(newSprint.endDate);
            if (newStartDate > endDate) {
                alert("Start date cannot be after end date");
                return;
            }
        }
        
        // If changing end date, validate against start date
        if (name === 'endDate' && newSprint.startDate) {
            const startDate = new Date(newSprint.startDate);
            const newEndDate = new Date(value);
            if (newEndDate < startDate) {
                alert("End date cannot be before start date");
                return;
            }
        }

        setNewSprint(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle sprint edit
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

    // Handle form submission (create or edit)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate dates
        const startDate = new Date(newSprint.startDate);
        const endDate = new Date(newSprint.endDate);
        
        if (endDate < startDate) {
            alert("End date cannot be before start date");
            return;
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
            } else {
                await createSprintMutation.mutateAsync({
                    name: newSprint.name,
                    status: "Planned",
                    goal: newSprint.goal,
                    startDate: formatDateForAPI(startDate),
                    endDate: formatDateForAPI(endDate),
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save sprint:", error);
            // TODO: Add error notification
        }
    };

    // Handle sprint delete
    const handleDeleteSprint = async (sprintId: string) => {
        setSprintToDelete(sprintId);
        setIsDeleteModalOpen(true);
    };

    // Handle delete confirmation
    const handleConfirmDelete = async () => {
        if (sprintToDelete) {
            try {
                await deleteSprintMutation.mutateAsync(sprintToDelete);
                setSprintToDelete(null);
            } catch (error) {
                console.error("Failed to delete sprint:", error);
                // TODO: Add error notification
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
        <div className="sprints-page">
            {/* Header section with title and create button */}
            <div className="flex items-baseline justify-between w-full">
                <div className="sprints-page__header">
                    <h1>Sprints</h1>
                    <p>Manage your project sprints</p>
                </div>
                <Button
                    variant="default"
                    size="default"
                    onClick={() => setIsModalOpen(true)}
                >
                    <PlusIcon className="mr-1 h-4 w-4" />
                    Create Sprint
                </Button>
            </div>

            {/* Divider line */}
            <div className="sprints-page__divider"></div>

            {/* Main content section */}
            <div className="sprints-page__content">
                {sprints && sprints.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sprint Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Goal</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                {canEdit && <TableHead>Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sprints.map((sprint: Sprint) => (
                                <TableRow key={sprint.id}>
                                    <TableCell>
                                        <h3 className="sprint-name">{sprint.name}</h3>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`status-badge status-badge--${sprint.status?.toLowerCase()}`}>
                                            {sprint.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {sprint.goal || 'No goal defined'}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(sprint.startDate)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(sprint.endDate)}
                                    </TableCell>
                                    {canEdit && (
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditSprint(sprint)}
                                                    className="h-8 w-8"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteSprint(sprint.id)}
                                                    className="h-8 w-8 text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    // Empty state message
                    <div className="sprints-page__empty">
                        <p>No sprints found. Create your first sprint to get started!</p>
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
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="space-y-4">
                        {/* Sprint Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">
                                Sprint Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newSprint.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                placeholder="Enter sprint name"
                                required
                            />
                        </div>
                        {/* Sprint Goal Input */}
                        <div>
                            <label htmlFor="goal" className="block text-sm font-medium mb-1">
                                Sprint Goal
                            </label>
                            <textarea
                                id="goal"
                                name="goal"
                                value={newSprint.goal}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                placeholder="Enter sprint goal"
                                rows={3}
                            />
                        </div>
                        {/* Status Dropdown - Only show when editing */}
                        {isEditing && (
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium mb-1">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={newSprint.status}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="Planned">Planned</option>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        )}
                        {/* Start Date Input */}
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={newSprint.startDate}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        {/* End Date Input */}
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={newSprint.endDate}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    </div>
                    {/* Modal Action Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                        >
                            {isEditing ? "Save Changes" : "Create Sprint"}
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
    );
};

export default SprintsPage;
