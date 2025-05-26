// src/components/BacklogTable/GenerateEpicsModal.tsx
import {FC, useEffect, useState} from "react";
import {Sparkles, Trash2} from "lucide-react";
import styles from "./GenerateEpicsModal.module.css"; // Styles will be adjusted
import aiEpicsService from "@/services/aiEpicsServices.ts";
import {AiEpicSuggestion} from "@/types/ai.ts";
import DeleteConfirmationModal from "@/components/ui/deleteConfirmationModal/deleteConfirmationModal.tsx";
import {Button} from "@/components/ui/button.tsx";

interface GenerateEpicsModalProps {
    projectId: string;
    projectName: string;
    isOpen: boolean; // This prop might still be useful for triggering data fetching, even if not controlling visibility directly
    onClose: () => void; // This is the crucial prop to close the parent modal/view
    onEpicsAdded: () => void;
    onError?: (message: string) => void;
}

const GenerateEpicsModal: FC<GenerateEpicsModalProps> = ({
                                                             projectId,
                                                             projectName,
                                                             isOpen, // Keep for effect, though visibility is by parent
                                                             onClose,  // This will call the parent's onClose
                                                             onEpicsAdded,
                                                             onError,
                                                         }) => {
    const [suggestedEpics, setSuggestedEpics] = useState<AiEpicSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        // `isOpen` here refers to the conceptual state of this view being active
        // and ready to fetch data.
        if (isOpen && projectId) {
            generateSuggestions();
        } else if (!isOpen) {
            // Clear state when this view is conceptually "closed" or replaced
            setSuggestedEpics([]);
            setError(null);
            setHasChanges(false);
        }
    }, [isOpen, projectId]); // isOpen prop from parent indicates this view is active

    const handleCloseWithConfirmation = () => {
        if (suggestedEpics.length > 0 && hasChanges && !isLoading && !isGenerating) {
            setShowWarningModal(true);
        } else {
            // If no changes, or loading/generating (buttons should be disabled anyway),
            // or if called directly, proceed to close.
            handleConfirmedClose();
        }
    };

    const handleConfirmedClose = () => {
        aiEpicsService.clearCache(projectId);
        onClose(); // Call the onClose prop passed from Form.tsx
                   // This should trigger the parent modal to close.
    };

    const generateSuggestions = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const epics = await aiEpicsService.generateEpics(projectId);
            setSuggestedEpics(epics);
            setHasChanges(true);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to generate epic suggestions";
            console.error("Error generating epics:", err);
            setError(msg);
            onError?.(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    const updateEpic = (
        index: number,
        field: keyof AiEpicSuggestion,
        value: string | null | "lowest" | "low" | "medium" | "high" | "highest"
    ) => {
        const updatedEpics = [...suggestedEpics];
        updatedEpics[index] = {
            ...updatedEpics[index],
            [field]: value,
        };
        setSuggestedEpics(updatedEpics);
        setHasChanges(true);
    };

    const removeEpic = (index: number) => {
        setSuggestedEpics((prev) => prev.filter((_, i) => i !== index));
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (suggestedEpics.length === 0) {
            setError("No epics to add");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await aiEpicsService.confirmEpics(projectId, suggestedEpics);
            onEpicsAdded(); // This will trigger navigation and alert in Form.tsx
            setHasChanges(false);
            // `onClose()` is typically called by `onEpicsAdded`'s handler in the parent
            // or Form.tsx manages closing after epics are added.
            // Based on Form.tsx, `onEpicsAdded` leads to `onClose()`.
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to add epics to backlog";
            console.error("Error adding epics:", err);
            setError(msg);
            onError?.(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // This component now returns the *content* for the "Generate Epics" phase.
    // The parent `Form.tsx` handles the actual modal shell.
    return (
        <div className={styles.generateEpicsViewContainer}>
            {/* View Header */}
            <div className={styles.viewHeader}>
                <h2>AI Suggested Epics for "{projectName}"</h2>

            </div>

            {/* Static Content Area (Error, Description, Regenerate Button) */}
            <div className={styles.staticContentTop}>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <p className={styles.viewDescription}>
                    Review, edit, or remove the suggested epics below before adding them to your project backlog.
                </p>
                <button
                    onClick={generateSuggestions}
                    disabled={isGenerating || isLoading}
                    className={styles.regenerateButton}
                >
                    <Sparkles size={16}/>
                    {isGenerating ? "Generating..." : "Regenerate Suggestions"}
                </button>
            </div>

            {/* Scrollable Epics Area */}
            <div className={styles.scrollableEpicsArea}>
                {isGenerating ? (
                    <div className={styles.centeredContent}>
                        <div className={styles.spinner}></div>
                    </div>
                ) : suggestedEpics.length === 0 && !error ? ( // Show only if no error, otherwise error msg is shown above
                    <div className={styles.centeredContent}>
                        <p>No epic suggestions available. Try generating again.</p>
                    </div>
                ) : (
                    <div className={styles.epicsListContainer}>
                        {suggestedEpics.map((epic, index) => (
                            <div key={index} className={styles.epicItem}>
                                <button
                                    onClick={() => removeEpic(index)}
                                    className={styles.removeEpicButton}
                                    title="Remove Epic"
                                    disabled={isLoading || isGenerating}
                                >
                                    <Trash2 size={16}/>
                                </button>
                                <div className={styles.formGroup}>
                                    <label htmlFor={`name-${index}`}>Name*</label>
                                    <input
                                        id={`name-${index}`}
                                        type="text"
                                        value={epic.name}
                                        onChange={(e) => updateEpic(index, "name", e.target.value)}
                                        required
                                        placeholder="Epic name"
                                        disabled={isLoading || isGenerating}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor={`description-${index}`}>Description</label>
                                    <textarea
                                        id={`description-${index}`}
                                        value={epic.description || ""}
                                        onChange={(e) => updateEpic(index, "description", e.target.value)}
                                        rows={3}
                                        placeholder="Epic description"
                                        disabled={isLoading || isGenerating}
                                    />
                                </div>
                                <div className={`${styles.formGroup} ${styles.priorityGroup}`}>
                                    <label htmlFor={`priority-${index}`}>Priority</label>
                                    <select
                                        id={`priority-${index}`}
                                        value={epic.priority}
                                        onChange={(e) => updateEpic(index, "priority", e.target.value as any)}
                                        disabled={isLoading || isGenerating}
                                    >
                                        <option value="lowest">Lowest</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="highest">Highest</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View Actions (Footer) */}
            <div className={styles.viewActions}>
                <Button
                    variant={"secondary"}
                    type="button"
                    onClick={handleCloseWithConfirmation}
                    disabled={isLoading || isGenerating}
                >
                    Cancel
                </Button>
                <Button
                    variant={"default"}
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading || isGenerating || suggestedEpics.length === 0}
                >
                    {isLoading ? "Adding Epics..." : (
                        <p>Add to Backlog</p>
                    )}
                </Button>
            </div>

            {/* DeleteConfirmationModal is a true modal, shown on top of this view if needed */}
            <DeleteConfirmationModal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)} // This just closes the warning itself
                onConfirm={handleConfirmedClose}         // This confirms the discard and closes the main view
                title="Discard Generated Epics"
                message="You have unsaved epic suggestions. If you close now, these suggestions will be lost and the cache will be cleared. Are you sure you want to continue?"
            />
        </div>
    );
};

export default GenerateEpicsModal;