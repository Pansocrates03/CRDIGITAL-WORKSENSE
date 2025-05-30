import React, { FC, useState, useEffect } from "react";
import { Ticket } from "@/types/TicketType";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X, RefreshCw, Plus, Trash2 } from "lucide-react";
import SelectField from "@/components/BacklogTable/SelectField";
import styles from "@/components/BacklogTable/CreateItemModal.module.css";
import { useTickets } from "@/hooks/useTickets";
import { useStories } from "@/hooks/useStories";
import { useMembers } from "@/hooks/useMembers";

interface TicketModalProps {
    mode: "create" | "update";
    isOpen: boolean;
    onClose: () => void;
    onTicketCreated?: () => void;
    onTicketUpdated?: () => void;
    onError?: (message: string) => void;
    ticket?: Ticket;
    projectId: string;
}

const TicketModal: FC<TicketModalProps> = ({
    mode,
    isOpen,
    onClose,
    onTicketCreated,
    onTicketUpdated,
    onError,
    ticket,
    projectId
}) => {
    const { addTicket, updateTicket } = useTickets(projectId);
    const { data: stories = [] } = useStories(projectId);
    const { data: members=[] } = useMembers(projectId);

    let memberOptions : {label:string, value:string}[] = [];
    members.forEach(member => {
        memberOptions.push({value: member.userId, label: member.user.firstName || "unknown"})
    })
    console.log("memberOptions", memberOptions);

    const initialState: Ticket = {
        id: "",
        name: "",
        description: "",
        status: "new",
        priority: "medium",
        assignedTo: "",
        parentId: "",
        tasks: []
    };

    const [formData, setFormData] = useState<Ticket>(ticket || initialState);
    const [newTask, setNewTask] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && ticket) {
            setFormData(ticket);
        } else if (!isOpen) {
            setFormData(initialState);
            setIsSubmitting(false);
            setError(null);
        }
    }, [isOpen, ticket]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTask = () => {
        if (newTask.trim()) {
            setFormData(prev => ({
                ...prev,
                tasks: [...prev.tasks, { name: newTask.trim(), isFinished: false }]
            }));
            setNewTask("");
        }
    };

    const handleRemoveTask = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.filter((_, i) => i !== index)
        }));
    };

    const handleToggleTask = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.map((task, i) => 
                i === index ? { ...task, isFinished: !task.isFinished } : task
            )
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (mode === "create") {
                const { id, ...ticketData } = formData;
                await addTicket(ticketData);
                onTicketCreated?.();
            } else if (ticket?.id) {
                await updateTicket({ ...formData, id: ticket.id });
                onTicketUpdated?.();
            }
            onClose();
        } catch (err: any) {
            const msg = err.message || "Failed to save ticket";
            setError(msg);
            onError?.(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setFormData(initialState);
        setNewTask("");
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
        story: [
            { value: "", label: "Select Story (Optional)" },
            ...stories.map(story => ({
                value: story.id,
                label: story.name
            }))
        ]
    };

    return (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{mode === "create" ? "Create New Ticket" : "Update Ticket"}</h2>
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
                            placeholder="Enter ticket name"
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
                        id="parentId"
                        name="parentId"
                        value={formData.parentId}
                        onChange={handleChange}
                        options={selectOptions.story}
                        label="Parent Story"
                        styleClass="story"
                        disabled={isSubmitting}
                    />

                    <SelectField
                        id="assignedTo"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        options={memberOptions}
                        label="Asignee"
                        styleClass="story"
                        disabled={isSubmitting}
                    />

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            disabled={isSubmitting}
                            placeholder="Enter ticket description"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Tasks</label>
                        <div className="flex gap-2 mb-2">
                            <Input
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="Add a new task"
                                disabled={isSubmitting}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddTask}
                                disabled={isSubmitting || !newTask.trim()}
                            >
                                <Plus size={16} />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {formData.tasks.map((task, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={task.isFinished}
                                        onChange={() => handleToggleTask(index)}
                                        disabled={isSubmitting}
                                        className="h-4 w-4"
                                    />
                                    <span className={task.isFinished ? "line-through text-gray-500" : ""}>
                                        {task.name}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveTask(index)}
                                        disabled={isSubmitting}
                                        className="ml-auto"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            ))}
                        </div>
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
                                    {mode === "create" ? "Create Ticket" : "Update Ticket"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketModal;
