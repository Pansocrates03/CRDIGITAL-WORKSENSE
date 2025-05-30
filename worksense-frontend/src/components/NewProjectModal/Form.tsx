import React, { useMemo, useRef, useState } from "react";
import InputWithClear from "./InputWithClear";
import MemberSelection from "./MemberSelection";
import Member from "@/types/MemberType";
import styles from "./NewProjectModal.module.css";
import { createMember } from "@/hooks/useMembers.ts";
import GenerateEpicsModal from "../../pages/CreateProject/components/GenerateEpicsModal.tsx";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label.tsx";
import { useUsers } from "@/hooks/useUsers.ts";
import { useProjects } from "@/hooks/useProjects.ts";
import aiEpicsService from "@/services/aiEpicsServices.ts";

type FormError = {
    projectName?: string;
    description?: string;
    members?: string;
}

type Alert = {
    type: "success" | "error";
    title: string;
    message: string;
}

interface FormProps {
    currentUserId: string;
    onClose: () => void;
}

const Form: React.FC<FormProps> = ({ currentUserId, onClose }) => {
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [shouldPopulateBacklog, setShouldPopulateBacklog] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<Omit<Member, "user">[]>([]);
    const [errors, setErrors] = useState<FormError>({});
    const [alert, setAlert] = useState<Alert | null>(null);

    // Modal state
    const [showGenerateEpicsModal, setShowGenerateEpicsModal] = useState(false);
    const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
    const [isPopulatingBacklog, setIsPopulatingBacklog] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);

    // API hooks
    const { data: users = [], isLoading: isUsersLoading } = useUsers();
    const { createProject } = useProjects();

    // Computed values
    const availableUsers = useMemo(() => {
        return users.filter(
            (user) =>
                user.userId !== currentUserId &&
                !selectedMembers.some((member) => member.userId === user.userId)
        );
    }, [users, selectedMembers, currentUserId]);

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: FormError = {};
        if (!projectName.trim()) newErrors.projectName = "Name is required";
        if (!description.trim()) newErrors.description = "Description is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Member handlers
    const handleAddMember = (member: Omit<Member, "user">) => {
        setSelectedMembers((prevMembers) => [...prevMembers, member]);
    };

    const handleRemoveMember = (userId: string) => {
        setSelectedMembers((prevMembers) => 
            prevMembers.filter((m) => m.userId !== userId)
        );
    };

    // Project creation handlers
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsCreatingProject(true);
            const newProject = await createProject({
                name: projectName,
                description: description,
                ownerId: currentUserId,
            });

            // Add members to the project
            await Promise.all(
                selectedMembers.map(member => 
                    createMember(newProject.id, member)
                )
            );

            // Handle AI backlog generation
            if (shouldPopulateBacklog) {
                setIsPopulatingBacklog(true);
                setCreatedProjectId(newProject.id);
                setShowGenerateEpicsModal(true);
            } else {
                onClose();
                navigate(`/project/${newProject.id}`);
            }
        } catch (error) {
            console.error('Error creating project:', error);
            setAlert({
                type: "error",
                title: "Error creating project",
                message: "An error occurred while creating the project. Please try again.",
            });
        } finally {
            setIsCreatingProject(false);
        }
    };

    // Epic generation handlers
    const handleEpicsAdded = () => {
        setIsPopulatingBacklog(false);
        setShowGenerateEpicsModal(false);
        setAlert({
            type: "success",
            title: "Epics added to backlog",
            message: "Epics have been successfully generated and added to the project backlog.",
        });
        onClose();
        if (createdProjectId) {
            navigate(`/project/${createdProjectId}`);
        }
    };

    const handleEpicGenerationError = (message: string) => {
        setIsPopulatingBacklog(false);
        setAlert({
            type: "error",
            title: "Error generating epics",
            message,
        });
    };

    // Render form or epic generation modal
    if (isPopulatingBacklog && createdProjectId) {
        return (
            <GenerateEpicsModal
                projectId={createdProjectId}
                projectName={projectName}
                isOpen={showGenerateEpicsModal}
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
        );
    }

    return (
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
                        <label htmlFor="populateBacklog" className={styles.checkboxLabel}>
                            Automatically generate backlog with AI
                            <span className={styles.aiLabel}>
                                <Sparkles size={12} className="mr-1"/> AI
                            </span>
                        </label>
                    </div>
                    {shouldPopulateBacklog && (
                        <p className={styles.aiDescription}>
                            We will analyze the description to generate epics and stories for your project backlog.
                        </p>
                    )}
                </div>
            </form>

            <div className={styles.modalActions}>
                <Button
                    variant="secondary"
                    type="button"
                    onClick={onClose}
                    disabled={isCreatingProject || isPopulatingBacklog}
                >
                    Cancel
                </Button>

                <Button
                    variant="default"
                    type="submit"
                    form="projectForm"
                    onClick={handleSubmit}
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
    );
};

export default Form;