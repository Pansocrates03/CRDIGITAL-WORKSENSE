// src/components/BacklogTable/ItemDetailsModal.tsx
import React, { FC, useState, useEffect } from "react";
import { X, Edit, MessageSquare, Link2 } from "lucide-react";
import apiClient from "@/api/apiClient";
import styles from "./CreateItemModal.module.css";
import { Epic, User } from "./types";
import StatusBadge from "./StatusBadge";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";

interface BacklogItemFormData {
  title: string;
  type: string;
  status: string;
  priority: string;
  epicId?: string | null;
  storyPoints?: number | null;
  severity?: string | null;
  assigneeId?: string | number | null;
  content?: string;
  tags?: string[];
}

interface BacklogItem extends BacklogItemFormData {
  id: string;
}

interface ItemDetailsModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onEditClick: () => void;
  onItemUpdated?: () => void;
  item: BacklogItem | null;
}

const ItemDetailsModal: FC<ItemDetailsModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onEditClick,
  item,
}) => {
  console.log("ItemDetailsModal: renderizando con isOpen =", isOpen, "item =", item);
  
  const [linkedEpic, setLinkedEpic] = useState<Epic | null>(null);
  const [assignee, setAssignee] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("ItemDetailsModal: useEffect con isOpen =", isOpen, "item =", item);
    if (isOpen && item) {
      console.log("ItemDetailsModal: ejecutando fetchRelatedData");
      fetchRelatedData();
    } else if (!isOpen) {
      setLinkedEpic(null);
      setAssignee(null);
    }
  }, [isOpen, item, projectId]);

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

      // Fetch assignee data if there's an assigneeId
      if (item.assigneeId) {
        try {
          const assigneeId = typeof item.assigneeId === "string" 
            ? parseInt(item.assigneeId) 
            : Number(item.assigneeId);
            
          const userRes = await apiClient.get(
            `/projects/${projectId}/members/${assigneeId}`
          );
          setAssignee(userRes.data);
        } catch (err) {
          console.error("Error fetching assignee:", err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    console.log("ItemDetailsModal: no está abierto, retornando null");
    return null;
  }
  
  if (!item) {
    console.log("ItemDetailsModal: item es null, retornando null");
    return null;
  }
  
  console.log("ItemDetailsModal: renderizando modal");

  // Helper function to get the capitalized type
  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "epic": return "Epic";
      case "story": return "User Story";
      case "bug": return "Bug";
      case "techTask": return "Tech Task";
      case "knowledge": return "Knowledge Item";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "700px" }}
      >
        <div className={styles.modalHeader}>
          <h2>
            {getItemTypeLabel(item.type)} Details
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-xl font-semibold">{item.title}</h1>
            <button
              onClick={onEditClick}
              className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md transition-colors"
            >
              <Edit size={14} />
              Edit
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">STATUS</span>
              {item.status ? (
                <StatusBadge type="status" value={item.status} />
              ) : (
                <span className="text-sm text-gray-400">No status</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">PRIORITY</span>
              <StatusBadge type="priority" value={item.priority} />
            </div>

            {item.type === "story" && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">POINTS</span>
                <span className="text-sm font-medium">
                  {item.storyPoints !== null && item.storyPoints !== undefined
                    ? item.storyPoints
                    : "Not set"}
                </span>
              </div>
            )}

            {item.type === "bug" && item.severity && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">SEVERITY</span>
                <StatusBadge type="severity" value={item.severity} />
              </div>
            )}
          </div>

          {linkedEpic && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-md">
              <Link2 size={16} className="text-gray-500" />
              <div>
                <span className="text-xs text-gray-500 block">EPIC</span>
                <span className="text-sm font-medium">{linkedEpic.title}</span>
              </div>
            </div>
          )}

          {assignee && (
            <div className="mb-4">
              <span className="text-xs text-gray-500 block mb-1">ASSIGNEE</span>
              <div className="flex items-center gap-2">
                <AvatarDisplay
                  user={{
                    name: assignee.name || `User ${assignee.id}`,
                    profilePicture: assignee.profilePicture,
                  }}
                  size="sm"
                />
                <span className="text-sm">
                  {assignee.name || assignee.nickname || `User ${assignee.id}`}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Description</h3>
            <div className="bg-gray-50 p-3 rounded-md min-h-28 text-sm">
              {item.content ? (
                <div dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br/>') }} />
              ) : (
                <span className="text-gray-400">No description provided</span>
              )}
            </div>
          </div>

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