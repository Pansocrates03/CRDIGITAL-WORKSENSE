// src/components/BacklogTable/ItemDetailsModal.tsx
import React, { FC, useState, useEffect } from "react";
import { X, Edit, Link2, User } from "lucide-react";
import apiClient from "@/api/apiClient";
import styles from "./CreateItemModal.module.css";
import { Epic, User as UserType } from "./types";
import StatusBadge from "./StatusBadge";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";

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
  memberMap?: Map<number, Member>; // Accept memberMap from parent component
}

const ItemDetailsModal: FC<ItemDetailsModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onEditClick,
  onItemUpdated,
  item,
  memberMap,
}) => {
  const [linkedEpic, setLinkedEpic] = useState<Epic | null>(null);
  const [assignee, setAssignee] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [itemDetails, setItemDetails] = useState<BacklogItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [localMemberMap, setLocalMemberMap] = useState<Map<number, Member>>(
    new Map()
  );

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLinkedEpic(null);
      setAssignee(null);
      setItemDetails(null);
      setError(null);
    }
  }, [isOpen]);

  // Fetch item data when modal opens
  useEffect(() => {
    if (isOpen && item) {
      fetchItemDetails();

      // If we already have a memberMap from props, use it
      if (memberMap && memberMap.size > 0) {
        setLocalMemberMap(memberMap);
      } else {
        // Otherwise fetch members
        fetchMembers();
      }

      // Fetch related data like epics
      fetchRelatedData();
    }
  }, [isOpen, item, projectId, memberMap]);

  // Update assignee when item details or member map changes
  useEffect(() => {
    if (
      itemDetails &&
      (localMemberMap.size > 0 || (memberMap && memberMap.size > 0))
    ) {
      updateAssignee();
    }
  }, [itemDetails, localMemberMap, memberMap]);

  const updateAssignee = () => {
    if (!itemDetails || !itemDetails.assigneeId) {
      setAssignee(null);
      return;
    }

    // Handle assigneeId conversion (similar to BacklogRow)
    const assigneeId =
      itemDetails.assigneeId !== undefined && itemDetails.assigneeId !== null
        ? typeof itemDetails.assigneeId === "string"
          ? parseInt(itemDetails.assigneeId)
          : Number(itemDetails.assigneeId)
        : null;

    if (assigneeId === null) {
      setAssignee(null);
      return;
    }

    // Try to get member from provided memberMap first
    if (memberMap && memberMap.has(assigneeId)) {
      setAssignee(memberMap.get(assigneeId) || null);
      return;
    }

    // Fall back to our local member map
    if (localMemberMap.has(assigneeId)) {
      setAssignee(localMemberMap.get(assigneeId) || null);
      return;
    }

    // If we couldn't find the member in the maps, fetch it directly
    if (assigneeId) {
      fetchAssigneeDirectly(assigneeId);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await apiClient.get(
        `/projects/${projectId}/members/members-detail`
      );

      if (Array.isArray(response.data)) {
        setMembers(response.data);

        // Create a map of userId to member
        const map = new Map<number, Member>();
        response.data.forEach((member: Member) => {
          if (member.userId) {
            map.set(member.userId, member);
          }
        });

        setLocalMemberMap(map);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const fetchItemDetails = async () => {
    if (!item) return;

    try {
      const response = await apiClient.get(
        `/projects/${projectId}/backlog/items/${item.id}?type=${item.type}`
      );

      if (response.data) {
        // Map description to content if needed
        const itemData = { ...response.data };
        if (itemData.description && !itemData.content) {
          itemData.content = itemData.description;
        }
        setItemDetails(itemData);
      }
    } catch (err) {
      console.error("Error fetching item details:", err);
    }
  };

  const fetchRelatedData = async () => {
    if (!item) return;
    setLoading(true);

    try {
      // Fetch epic data if there's an epicId
      if (item.epicId) {
        try {
          const epicRes = await apiClient.get(
            `/projects/${projectId}/backlog/items/${item.epicId}`
          );
          setLinkedEpic(epicRes.data);
        } catch (err) {
          console.error("Error fetching epic:", err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAssigneeDirectly = async (assigneeId: number) => {
    try {
      const userRes = await apiClient.get(
        `/projects/${projectId}/members/${assigneeId}`
      );

      if (userRes.data) {
        setAssignee(userRes.data);

        // Add to local map for future reference
        setLocalMemberMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(assigneeId, userRes.data);
          return newMap;
        });
      }
    } catch (err) {
      console.error("Error fetching assignee:", err);
    }
  };

  if (!isOpen || !item) {
    return null;
  }

  // Use itemDetails if available, otherwise fall back to the original item
  const displayItem = itemDetails || item;

  // Handle content field by looking at both content and description fields
  const descriptionContent =
    displayItem.content || displayItem.description || "";

  // Helper function to get the capitalized type
  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "epic":
        return "Epic";
      case "story":
        return "User Story";
      case "bug":
        return "Bug";
      case "techTask":
        return "Tech Task";
      case "knowledge":
        return "Knowledge Item";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Get assignee display name using the same pattern as BacklogRow
  const assigneeName =
    assignee?.name ||
    assignee?.nickname ||
    (assignee?.userId ? `User ${assignee.userId}` : null);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "700px" }}
      >
        <div className={styles.modalHeader}>
          <h2>{getItemTypeLabel(displayItem.type)} Details</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-xl font-semibold">{displayItem.name}</h1>
            <button
              onClick={onEditClick}
              className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md transition-colors"
            >
              <Edit size={14} />
              Edit
            </button>
          </div>

          {/* Assignee Section - Now using same pattern as BacklogRow */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <span className="text-xs text-gray-500 block mb-2">ASSIGNEE</span>
            <div className="flex items-center gap-3">
              {assignee ? (
                <>
                  <AvatarDisplay
                    user={{
                      name: assigneeName || "Unknown User",
                      profilePicture: assignee.profilePicture,
                    }}
                    size="md"
                  />
                  <div>
                    <span className="font-medium block">{assigneeName}</span>
                    {assignee.userId && (
                      <span className="text-xs text-gray-500">
                        ID: {assignee.userId}
                      </span>
                    )}
                  </div>
                </>
              ) : displayItem.assigneeId ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <span className="font-medium block text-gray-400">
                      {typeof displayItem.assigneeId === "string" ||
                      typeof displayItem.assigneeId === "number"
                        ? `Loading user ${displayItem.assigneeId}...`
                        : "Loading assignee..."}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={16} className="text-gray-400" />
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
          <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">STATUS</span>
              {displayItem.status ? (
                <StatusBadge type="status" value={displayItem.status} />
              ) : (
                <span className="text-sm text-gray-400">No status</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">PRIORITY</span>
              <StatusBadge type="priority" value={displayItem.priority} />
            </div>

            {displayItem.type === "story" && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">POINTS</span>
                <span className="text-sm font-medium">
                  {displayItem.size !== null && displayItem.size !== undefined
                    ? displayItem.size
                    : "Not set"}
                </span>
              </div>
            )}

            {displayItem.type === "bug" && displayItem.severity && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">SEVERITY</span>
                <StatusBadge type="severity" value={displayItem.severity} />
              </div>
            )}
          </div>

          {linkedEpic && (
            <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 rounded-md">
              <Link2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{linkedEpic.name}</span>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Description</h3>
            <div className="bg-gray-50 p-3 rounded-md min-h-28 text-sm">
              {descriptionContent ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: descriptionContent.replace(/\n/g, "<br/>"),
                  }}
                />
              ) : (
                <span className="text-gray-400">No description provided</span>
              )}
            </div>
          </div>

          {/* Acceptance Criteria Section - Only displayed for stories */}
          {displayItem.type === "story" && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Acceptance Criteria</h3>
              <div className="bg-gray-50 p-3 rounded-md min-h-28 text-sm">
                {displayItem.acceptanceCriteria &&
                displayItem.acceptanceCriteria.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {displayItem.acceptanceCriteria.map((criterion, index) => (
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

          {displayItem.tags && displayItem.tags.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {displayItem.tags.map((tag, index) => (
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

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            <X size={16} className="mr-1" /> Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;
