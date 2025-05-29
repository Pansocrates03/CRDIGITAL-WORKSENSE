import React, { FC, useState, useEffect } from "react";
import { Story } from "@/types/StoryType";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X, RefreshCw } from "lucide-react";
import SelectField from "@/components/BacklogTable/SelectField";
import styles from "@/components/BacklogTable/CreateItemModal.module.css";
import { useStories } from "@/hooks/useStories";
import { useEpics } from "@/hooks/useEpics";
import { useSprints } from "@/hooks/useSprints";

interface StoryModalProps {
    mode: "create" | "update";
    isOpen: boolean;
    onClose: () => void;
    onStoryCreated?: () => void;
    onStoryUpdated?: () => void;
    onError?: (message: string) => void;
    story?: Story;
    projectId: string;
}

const StoryModal: FC<StoryModalProps> = ({
    mode,
    isOpen,
    onClose,
    onStoryCreated,
    onStoryUpdated,
    onError,
    story,
    projectId
}) => {
    const { data:sprints=[] } = useSprints(projectId);
    const { addStory, updateStory } = useStories(projectId);
    const { data: epics = [] } = useEpics(projectId);

    const initialState: Story = {
        id: "",
        name: "",
        description: "",
        status: "new",
        priority: "medium",
        storyPoints: 0,
        assignedTo: "",
        parentId: "",
        sprintId: "",
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
    };

    const [formData, setFormData] = useState<Story>(story || initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && story) {
            setFormData(story);
        } else if (!isOpen) {
            setFormData(initialState);
            setIsSubmitting(false);
            setError(null);
        }
    }, [isOpen, story]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (mode === "create") {
                const { id, createdAt, updatedAt, ...storyData } = formData;
                await addStory(projectId, storyData as Story);
                onStoryCreated?.();
            } else {
                const { createdAt, updatedAt, ...storyData } = formData;
                await updateStory(projectId, storyData as Story)
                onStoryUpdated?.();
            }
            onClose();
        } catch (err: any) {
            const msg = err.message || "Failed to save story";
            setError(msg);
            onError?.(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setFormData(initialState);
    };

    if (!isOpen) return null;

    const selectOptions = {
        status: [
            { value: "new", label: "New" },
            { value: "toDo", label: "To Do" },
            { value: "inProgress", label: "In Progress" },
            { value: "inReview", label: "In Review" },
            { value: "done", label: "Done" },
        ],
        priority: [
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
        ],
        storyPoints: [
            { value: "0", label: "0" },
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "5", label: "5" },
            { value: "8", label: "8" },
            { value: "13", label: "13" },
            { value: "21", label: "21" },
        ],
        epic: [
            { value: "", label: "Select Epic (Optional)" },
            ...epics.map(epic => ({
                value: epic.id,
                label: epic.name
            }))
        ],
        sprint: [
            { value: "", label: "Select Epic (Optional)" },
            ...sprints.map(sprint => ({
                value: sprint.id,
                label: sprint.name
            }))
        ]
    };

    return (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{mode === "create" ? "Create New Story" : "Update Story"}</h2>
                    <Button
                        variant="outline"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close"
                        disabled={isSubmitting}
                    >
                        <X size={18} />
                    </Button>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Name*</label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter story name"
                            disabled={isSubmitting}
                        />
                    </div>

                    <SelectField
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        options={selectOptions.status}
                        label="Status"
                        styleClass="status"
                        disabled={isSubmitting}
                    />

                    <SelectField
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        options={selectOptions.priority}
                        label="Priority"
                        styleClass="priority"
                        disabled={isSubmitting}
                    />

                    <SelectField
                        id="storyPoints"
                        name="storyPoints"
                        value={formData.storyPoints.toString()}
                        onChange={handleChange}
                        options={selectOptions.storyPoints}
                        label="Story Points"
                        styleClass="storyPoints"
                        disabled={isSubmitting}
                    />

                    <SelectField
                        id="parentId"
                        name="parentId"
                        value={formData.parentId}
                        onChange={handleChange}
                        options={selectOptions.epic}
                        label="Epic"
                        styleClass="epic"
                        disabled={isSubmitting}
                    />

                    <SelectField
                        id="sprintId"
                        name="sprintId"
                        value={formData.sprintId}
                        onChange={handleChange}
                        options={selectOptions.sprint}
                        label="Sprint"
                        styleClass="sprint"
                        disabled={isSubmitting}
                    />

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                            disabled={isSubmitting}
                            placeholder="Enter story description"
                        />
                    </div>

                    <div className={styles.formActions}>
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={handleClear}
                            disabled={isSubmitting}
                        >
                            <RefreshCw size={16} className="mr-1" />
                            {mode === "create" ? "Clear" : "Reset"}
                        </Button>

                        <Button
                            variant="default"
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                "Loading..."
                            ) : (
                                <>
                                    <Save size={16} className="mr-1" />
                                    {mode === "create" ? "Create Story" : "Update Story"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StoryModal;