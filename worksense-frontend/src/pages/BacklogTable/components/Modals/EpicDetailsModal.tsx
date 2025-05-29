import React, { FC } from "react";
import { Epic } from "@/types/EpicType";
import { Story } from "@/types/StoryType";
import { Button } from "@/components/ui/button";
import { X, Edit, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import styles from "@/components/BacklogTable/CreateItemModal.module.css";

interface EpicDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    epic: Epic;
    stories: Story[];
    onEdit: () => void;
    onDelete: () => void;
    onAddStory: () => void;
}

const EpicDetailsModal: FC<EpicDetailsModalProps> = ({
    isOpen,
    onClose,
    epic,
    stories,
    onEdit,
    onDelete,
    onAddStory
}) => {
    if (!isOpen) return null;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "new":
                return "info";
            case "in progress":
                return "warning";
            case "completed":
                return "success";
            default:
                return "default";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "high":
                return "destructive";
            case "medium":
                return "warning";
            case "low":
                return "success";
            default:
                return "default";
        }
    };

    // Calculate epic statistics
    const totalStories = stories.length;
    const completedStories = stories.filter(story => story.status === "completed").length;
    const inProgressStories = stories.filter(story => story.status === "inProgress").length;
    const newStories = stories.filter(story => story.status === "new").length;

    const progressPercentage = totalStories > 0 
        ? Math.round((completedStories / totalStories) * 100) 
        : 0;

    return (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className="text-xl font-semibold">Epic Details</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAddStory}
                            className="flex items-center gap-1"
                        >
                            <Plus size={16} />
                            Add Story
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                            className="flex items-center gap-1"
                        >
                            <Edit size={16} />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDelete}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                            <Trash2 size={16} />
                            Delete
                        </Button>
                        <Button
                            variant="outline"
                            className={styles.closeButton}
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <X size={18} />
                        </Button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Epic Header */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold">{epic.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={getStatusColor(epic.status)}>
                                        {epic.status}
                                    </Badge>
                                    <Badge variant={getPriorityColor(epic.priority)}>
                                        {epic.priority}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-600">{epic.description || "No description provided"}</p>
                    </div>

                    {/* Progress Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Progress</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Overall Progress</span>
                                <span>{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{completedStories}</div>
                                    <div className="text-sm text-gray-600">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{inProgressStories}</div>
                                    <div className="text-sm text-gray-600">In Progress</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-600">{newStories}</div>
                                    <div className="text-sm text-gray-600">New</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stories Section */}
                    <div>
                        <h4 className="font-semibold mb-3">Stories ({totalStories})</h4>
                        <div className="space-y-2">
                            {stories.length > 0 ? (
                                stories.map((story) => (
                                    <div 
                                        key={story.id}
                                        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                                    >
                                        <div>
                                            <h5 className="font-medium">{story.name}</h5>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={getStatusColor(story.status)}>
                                                    {story.status}
                                                </Badge>
                                                <Badge variant={getPriorityColor(story.priority)}>
                                                    {story.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {story.storyPoints} points
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    No stories associated with this epic
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EpicDetailsModal; 