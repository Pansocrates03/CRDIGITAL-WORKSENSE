import React, { FC, useState, useEffect } from "react";
import { Epic } from "@/types/EpicType";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X, RefreshCw } from "lucide-react";
import SelectField from "@/components/BacklogTable/SelectField";
import styles from "@/components/BacklogTable/CreateItemModal.module.css";
import { useEpics } from "@/hooks/useEpics";

interface EpicModalProps {
    mode: "create" | "update";
    isOpen: boolean;
    onClose: () => void;
    onEpicCreated?: () => void;
    onEpicUpdated?: () => void;
    onError?: (message: string) => void;
    epic?: Epic;
    projectId: string;
}

const EpicModal: FC<EpicModalProps> = ({
    mode,
    isOpen,
    onClose,
    onEpicCreated,
    onEpicUpdated,
    onError,
    epic,
    projectId
}) => {
    const { addEpic, updateEpic } = useEpics(projectId);

    const initialState: Epic = {
        id: "",
        name: "",
        description: "",
        status: "new",
        priority: "medium",
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const [formData, setFormData] = useState<Epic>(epic || initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setFormData(initialState);
            setIsSubmitting(false);
            setError(null);
        }
    }, [isOpen]);

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
                const { id, createdAt, updatedAt, ...epicData } = formData;
                await addEpic(epicData);
                onEpicCreated?.();
            } else if (epic?.id) {
                const { id, createdAt, updatedAt, ...epicData } = formData;
                await updateEpic(epic.id, epicData);
                onEpicUpdated?.();
            }
            onClose();
        } catch (err: any) {
            const msg = err.message || "Failed to save epic";
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
            { value: "inProgress", label: "In Progress" },
            { value: "completed", label: "Completed" },
        ],
        priority: [
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
        ],
    };

    return (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{mode === "create" ? "Create New Epic" : "Update Epic"}</h2>
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
                            placeholder="Enter epic name"
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

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                            disabled={isSubmitting}
                            placeholder="Enter epic description"
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
                                    {mode === "create" ? "Create Epic" : "Update Epic"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EpicModal;