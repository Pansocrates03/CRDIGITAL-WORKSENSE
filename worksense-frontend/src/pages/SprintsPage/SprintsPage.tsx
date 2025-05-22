import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSprints, useCreateSprint } from "@/hooks/useSprintData";
import { Sprint } from "@/types/SprintType";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal/Modal";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import "./SprintsPage.css";

const SprintsPage: React.FC = () => {
    // Get project ID from URL parameters
    const { id: projectId } = useParams<{ id: string }>();
    
    // Fetch sprints data using custom hook
    const { data: sprints, isLoading, error } = useSprints(projectId ?? "");
    
    // Initialize mutation hook for creating new sprints
    const createSprintMutation = useCreateSprint(projectId ?? "");
    
    // State for controlling modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // State for managing form data
    const [newSprint, setNewSprint] = useState({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
    });

    // Function to reset form fields to empty values
    const resetForm = () => {
        setNewSprint({
            name: "",
            goal: "",
            startDate: "",
            endDate: "",
        });
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
    const formatDateForAPI = (date: string | Date) =>
        new Date(date).toISOString().split("T")[0];

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewSprint(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle sprint creation
    const handleCreateSprint = async () => {
        try {
            await createSprintMutation.mutateAsync({
                name: newSprint.name,
                status: "Planned",
                goal: newSprint.goal,
                startDate: formatDateForAPI(newSprint.startDate),
                endDate: formatDateForAPI(newSprint.endDate),
            });
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to create sprint:", error);
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
                    // Table to display sprints
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sprint Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Goal</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
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

            {/* Create Sprint Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Create New Sprint"
                size="m"
            >
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateSprint();
                }} className="p-4">
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
                            Create Sprint
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SprintsPage;
