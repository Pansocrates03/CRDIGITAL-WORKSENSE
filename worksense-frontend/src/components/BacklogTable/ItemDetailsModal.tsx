// src/components/BacklogTable/ItemDetailsModal.tsx
import React, {FC} from "react";
import {ArrowRight, Link2, User} from "lucide-react";
import styles from "./CreateItemModal.module.css";
import StatusBadge from "./StatusBadge";
import {AvatarDisplay} from "@/components/ui/AvatarDisplay";
import {Button} from "@/components/ui/button.tsx";

interface BacklogItemFormData {
    name: string;
    type: string;
    status: string;
    priority: string;
    epicId?: string | null;
    size?: string | null;
    severity?: string | null;
    assigneeId?: string | number | null;
    content?: string;
    description?: string; // Add support for description field from AI stories
    tags?: string[];
    acceptanceCriteria?: string[]; // Add support for acceptance criteria
}

interface BacklogItem extends BacklogItemFormData {
    id: string;
}

interface Member {
    userId: number;
    name?: string;
    nickname?: string;
    profilePicture?: string;
    id?: number; // For compatibility with different API responses
}

interface ItemDetailsModalProps {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
    onEditClick: () => void;
    onItemUpdated?: () => void;
    item: BacklogItem | null;
    memberInfo?: Member | null; // Accept member
    linkedEpic?: BacklogItem | null; // Added optional linkedEpic prop

}
const ItemDetailsModal: FC<ItemDetailsModalProps> = ({
    isOpen,
    onClose,
    onEditClick,
    item,
    memberInfo,
    linkedEpic
}) => {
    // If item is null or the modal is not open, don't render the modal content
    if (!item || !isOpen) {
        return null;
    }


    const epicName = linkedEpic?.name || "No linked epic";


    console.log("item", item);

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
                style={{maxWidth: "700px"}}
            >
                <div className={styles.modalHeader}>
                    <h1 className="text-xl font-semibold">{capitalizeFirstLetter(item.type)} Details: {item.name} </h1>
                    <div className="flex gap-5">
                        <Button
                            variant={"outline"}
                            onClick={onEditClick}>
                            Edit
                        </Button>
                        <Button variant={"outline"}
                                className={styles.closeButton}
                                onClick={onClose}
                                aria-label="Close"
                        >
                            <ArrowRight size={18}/>
                        </Button>
                    </div>
                </div>


                <div className="mb-6">
                    <div className="flex justify-between items-start mb-3">
                    </div>

                    {/* Assignee Section - Now using same pattern as BacklogRow */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <span className="text-xs text-gray-500 block mb-2">ASSIGNEE</span>
                        <div className="flex items-center gap-3">
                            {memberInfo ? (
                                <>
                                    <AvatarDisplay
                                        user={memberInfo}
                                        size="md"
                                    />
                                    <div>
                                        <span className="font-medium block">{memberInfo.name || 'Unknown User'}</span>
                                        {memberInfo.id && (
                                            <span className="text-xs text-gray-500">
                                                ID: {memberInfo.id}
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : item.assigneeId ? (
                                <>
                                    <div
                                        className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User size={16} className="text-gray-400"/>
                                    </div>
                                    <div>
                                        <span className="font-medium block text-gray-400">
                                            {typeof item.assigneeId === "string" ||
                                            typeof item.assigneeId === "number"
                                                ? `Loading user ${item.assigneeId}...`
                                                : "Loading assignee..."}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div
                                        className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User size={16} className="text-gray-400"/>
                                    </div>
                                    <div>
                                        <span className="font-medium block text-gray-400">
                                            Unassigned
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Item Info Section */}
                    <div className="flex flex-wrap justify-center gap-10 mb-4 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">STATUS</span>
                            {item.status ? (
                                <StatusBadge type="status" value={item.status}/>
                            ) : (
                                <span className="text-sm text-gray-400">No status</span>
                            )}
                        </div>

                        <div className="flex items-center gap-5">
                            <span className="text-xs text-gray-500">PRIORITY</span>
                            <StatusBadge type="priority" value={item.priority}/>
                        </div>

                        {item.type === "story" && (
                            <div className="flex items-center gap-5">
                                <span className="text-xs text-gray-500">Size</span>
                                <span className="text-sm font-medium">
                                    {item?.size !== null && item.size !== undefined
                                        ? item.size
                                        : "Not set"}
                                </span>
                            </div>
                        )}

                        {item.type === "bug" && item.severity && (
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">SEVERITY</span>
                                <StatusBadge type="severity" value={item.severity}/>
                            </div>
                        )}
                    </div>

                    {item?.epicId && (
                        <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 rounded-md">
                            <Link2 className="h-4 w-4 text-gray-500"/>
                            <span className="text-sm font-medium">{epicName}</span>
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">Description</h3>
                        <div className="bg-gray-50 p-3 rounded-md min-h-28 text-sm">
                            {item.description ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: item.description.replace(/\n/g, "<br/>"),
                                    }}
                                />
                            ) : (
                                <span className="text-gray-400">No description provided</span>
                            )}
                        </div>
                    </div>

                    {/* Acceptance Criteria Section - Only displayed for stories */}
                    {item.type === "story" && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium mb-2">Acceptance Criteria</h3>
                            <div className="bg-gray-50 p-3 rounded-md min-h-28 text-sm">
                                {item.acceptanceCriteria &&
                                item.acceptanceCriteria.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-1">
                                        {item.acceptanceCriteria.map((criterion, index) => (
                                            <li key={index}>{criterion}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-gray-400">
                                        No acceptance criteria defined
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {item.tags && item.tags.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {item.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-700"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};

export default ItemDetailsModal;