import React, {useMemo, useRef, useState} from "react";
import InputWithClear from "./InputWithClear";
import MemberSelection from "./MemberSelection";
import Member from "@/types/MemberType";
import {projectService} from "@/services/projectService";
import {useQuery, useQueryClient} from '@tanstack/react-query';
import styles from "./NewProjectModal.module.css";
import {User} from "@/types/UserType";
import apiClient from "../../api/apiClient";
import GenerateEpicsModal from "../../pages/CreateProject/components/GenerateEpicsModal.tsx";
import {Sparkles} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {Label} from "@/components/ui/label.tsx";

type localFormError = {
    projectName?: string;
    description?: string;
    members?: string;
}

const Form: React.FC<{ currentUserId: number, onClose: () => void }> = ({currentUserId, onClose}) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Variables de estado
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [shouldPopulateBacklog, setShouldPopulateBacklog] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const [showGenerateEpicsModal, setShowGenerateEpicsModal] = useState(false);
    const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
    const [isPopulatingBacklog, setIsPopulatingBacklog] = useState(false);

    // Referencias
    const inputRef = useRef<HTMLInputElement>(null);

    // Obtener usuarios desde la API
    const {isLoading: isUsersLoading, data: users = []} = useQuery({ // Removed unused isError, error
        queryKey: ["users"],
        queryFn: async (): Promise<User[]> => {
            const response = await apiClient.get("/users");
            return response.data;
        },
    });

    // Alertas (Assuming this is handled by a parent or global system as it's not rendered here)
    const [alert, setAlert] = useState<{
        type: "success" | "error";
        title: string;
        message: string;
    } | null>(null);

    // Errores del formulario y estado de envío
    const [errors, setErrors] = useState<localFormError>({});
    const [isCreatingProject, setIsCreatingProject] = useState(false);

    const availableUsers = useMemo(() => {
        return users.filter(
            (user) =>
                user.userId !== currentUserId &&
                !selectedMembers.some((member) => member.userId === user.userId)
        );
    }, [users, selectedMembers, currentUserId]);


    ///////////////
    // FUNCIONES //
    ///////////////

    const validateForm = (): boolean => {
        const newErrors: localFormError = {};
        if (!projectName.trim()) newErrors.projectName = "Name is required";
        if (!description.trim()) newErrors.description = "Description is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddMember = (member: Member) => {
        console.log("Adding member", member); // Kept as per "no functionality change"
        setSelectedMembers((prevMembers) => {
            const updatedMembers = [...prevMembers, member];
            console.log("Selected members after adding", updatedMembers); // Kept
            return updatedMembers;
        });
    };

    const handleRemoveMember = (userId: number) => {
        setSelectedMembers((prevMembers) => prevMembers.filter((m) => m.userId !== userId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsCreatingProject(true);
        setErrors({});
        setAlert(null); // Clear previous alerts

        try {
            const projectData = await projectService.createProejct({ // Renamed 'response' to 'projectData' for clarity
                name: projectName,
                description: description,
                context: {}, // Assuming context is meant to be empty or handled elsewhere
                members: selectedMembers,
            });

            if (projectData && projectData.id) {
                setCreatedProjectId(projectData.id);
                setAlert({
                    type: "success",
                    title: "Project created successfully",
                    message: `The project "${projectName}" has been created.`,
                });

                queryClient.invalidateQueries({queryKey: ["userProjects"]});

                if (!shouldPopulateBacklog) {
                    onClose();
                    navigate(`/project/${projectData.id}`);
                } else {
                    // Project created and AI backlog generation is requested
                    setIsPopulatingBacklog(true);
                    setShowGenerateEpicsModal(true); // Directly set state here
                }
            } else {
                // Handle cases where project creation might seem successful but ID is missing
                console.error("Project created but ID is missing or creation failed:", projectData);
                setAlert({
                    type: "error",
                    title: "Error creating project",
                    message: "Failed to create the project or retrieve its ID. Please try again.",
                });
            }
        } catch (error) {
            console.error("Error al crear proyecto:", error);
            setAlert({
                type: "error",
                title: "Error creating project",
                message: "An error occurred while creating the project. Please try again.",
            });
        } finally {
            setIsCreatingProject(false);
        }
    };

    const handleEpicsAdded = () => {
        setIsPopulatingBacklog(false);
        setShowGenerateEpicsModal(false);
        setAlert({
            type: "success",
            title: "Epics added to backlog",
            message: `Epics have been successfully generated and added to the project backlog.`,
        });
        onClose(); // Close the main modal
        if (createdProjectId) { // Ensure createdProjectId is available before navigating
            navigate(`/project/${createdProjectId}`);
        }
    };

    const handleEpicGenerationError = (message: string) => {
        setIsPopulatingBacklog(false);
        // setShowGenerateEpicsModal(false); // Consider if this should also be set to false
        // Based on original logic, it was not, so keeping it that way.
        // isPopulatingBacklog=false will hide the GenerateEpicsModal component anyway.
        setAlert({
            type: "error",
            title: "Error generating epics",
            message: message,
        });
        // Note: Original logic does not call onClose() or navigate() here,
        // allowing the user to remain on the form.
    };

    return (
        <>
            {!isPopulatingBacklog ? (
                <>
                    <form onSubmit={handleSubmit}>
                        <InputWithClear
                            id="projectName"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            onClear={() => setProjectName("")}
                            placeholder="Project name"
                            label="Name"
                            error={errors.projectName}
                            inputRef={inputRef}
                            required={true}
                        />

                        <MemberSelection
                            users={users}
                            selectedMembers={selectedMembers}
                            onAddMember={handleAddMember}
                            onRemoveMember={handleRemoveMember}
                            isLoading={isUsersLoading}
                            error={errors.members}
                            availableUsers={availableUsers}
                        />

                        <div className={styles.formGroup}>
                            <Label htmlFor="description">Description</Label>
                            <div className={styles.textareaWrapper}>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your project"
                                    rows={3}
                                    className={styles.textarea}
                                    aria-required="true"
                                    aria-invalid={!!errors.description}
                                />
                            </div>
                            {errors.description && (
                                <p className={styles.errorMessage}>{errors.description}</p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <div className={styles.checkboxWrapper}>
                                <input
                                    type="checkbox"
                                    id="populateBacklog"
                                    checked={shouldPopulateBacklog}
                                    onChange={(e) => setShouldPopulateBacklog(e.target.checked)}
                                />
                                <label
                                    htmlFor="populateBacklog"
                                    className={styles.checkboxLabel}
                                >
                                    Automatically generate backlog with AI
                                    <span className={styles.aiLabel}>
                                        <Sparkles size={12} className="mr-1"/> AI
                                    </span>
                                </label>
                            </div>
                            {shouldPopulateBacklog && (
                                <p className={styles.aiDescription}>
                                    We will analyze the description to generate epics and stories for your project
                                    backlog.
                                </p>
                            )}
                        </div>
                        {/* Modal Actions are outside the form tag in the original, but should be part of the logical form flow.
                            The submit button's onClick is removed as type="submit" handles it via form's onSubmit.
                            Placing action buttons logically with the form they control.
                        */}
                    </form>
                    <div className={styles.modalActions}>
                        <Button
                            variant={"secondary"}
                            type="button" // Explicitly type button to prevent form submission
                            onClick={onClose}
                            disabled={isCreatingProject || isPopulatingBacklog}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant={"default"}
                            type="submit" // This button will now trigger the form's onSubmit
                            form="projectForm" // Associate with form if it had an ID, or rely on nesting
                            // For simplicity, we can assume it's clear this button submits the above form.
                            // To be absolutely explicit if the form had an ID e.g. id="mainProjectForm", use form="mainProjectForm"
                            // Or, more commonly, ensure this button is *inside* the <form> tag.
                            // The original had the form closing before modalActions.
                            // Let's keep the original structure with button's onClick if it was outside form.
                            // Re-checking: The original JSX has <form> then <div modalActions>.
                            // So the submit button needs its own onClick.
                            onClick={handleSubmit} // Re-instating because it's outside the <form> element scope.
                            disabled={
                                !projectName.trim() ||
                                !description.trim() ||
                                isCreatingProject ||
                                isPopulatingBacklog
                            }
                        >
                            {isCreatingProject
                                ? "Creating..."
                                : shouldPopulateBacklog
                                    ? "Create & Generate Backlog"
                                    : "Create Project"}
                        </Button>
                    </div>
                </>
            ) : (
                // This GenerateEpicsModal is shown when isPopulatingBacklog is true
                createdProjectId && ( // Ensure projectId is available before rendering
                    <GenerateEpicsModal
                        projectId={createdProjectId}
                        projectName={projectName}
                        isOpen={showGenerateEpicsModal} // Controls the modal's own visibility
                        onClose={() => {
                            setShowGenerateEpicsModal(false);
                            setIsPopulatingBacklog(false);
                            onClose();
                            if (createdProjectId) {
                                navigate(`/project/${createdProjectId}`);

                            }
                        }}
                        onEpicsAdded={handleEpicsAdded}
                        onError={handleEpicGenerationError}
                    />
                )
            )}

            {/*
                The second, redundant GenerateEpicsModal instance has been removed.
                Original:
                {showGenerateEpicsModal && createdProjectId && (
                    <GenerateEpicsModal
                        projectId={createdProjectId}
                        projectName={projectName}
                        isOpen={showGenerateEpicsModal}
                        onClose={() => {
                            setShowGenerateEpicsModal(false);
                            setIsPopulatingBacklog(false);
                            onClose();
                            navigate(`/project/${createdProjectId}`);
                        }}
                        onEpicsAdded={handleEpicsAdded}
                        onError={handleEpicGenerationError}
                    />
                )}
            */}
        </>
    );
};

export default Form;