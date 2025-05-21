// src/components/BacklogTable/ItemDetailsModal.tsx
import React, { FC, useState, useEffect } from "react";
import { X, Edit, Link2, User } from "lucide-react";
import apiClient from "@/api/apiClient";
import styles from "./CreateItemModal.module.css";
import { Epic, User as UserType } from "./types";
import StatusBadge from "./StatusBadge";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";
import BacklogItemType from "@/types/BacklogItemType";

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
  item: BacklogItemType | null;
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
  const [itemDetails, setItemDetails] = useState<BacklogItemType | null>(null);
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
        setItemDetails(response.data);
      }
    } catch (err) {
      console.error("Error fetching item details:", err);
    }
  };

  const fetchRelatedData = async () => {
    if (!item) return;
    setLoading(true);

    try {
      // Fetch epic data if there's a parentId
      if (item.parentId) {
        try {
          const epicRes = await apiClient.get(
            `/projects/${projectId}/backlog/items/${item.parentId}`
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
      const response = await apiClient.get(
        `/projects/${projectId}/members/${assigneeId}`
      );
      if (response.data) {
        setAssignee(response.data);
      }
    } catch (err) {
      console.error("Error fetching assignee:", err);
    }
  };

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
        return "Knowledge";
      default:
        return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 style={{margin: 0, fontSize: '1.25rem', fontWeight: 600}}>
            {itemDetails?.name || 'Item Details'}
          </h2>
          <div style={{display: 'flex', gap: 8}}>
            <button
              className={styles.editButton}
              onClick={onEditClick}
              disabled={loading}
              style={{background: 'none', border: 'none', cursor: 'pointer'}}
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button
              className={styles.closeButton}
              onClick={onClose}
              disabled={loading}
              style={{background: 'none', border: 'none', cursor: 'pointer'}}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {loading ? (
          <div className={styles.loadingMessage}>Loading...</div>
        ) : (
          <>
            <div style={{marginBottom: 24}}>
              <h3 style={{fontWeight: 600, fontSize: '1rem', marginBottom: 12}}>Basic Information</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
                <div><span style={{fontWeight: 500}}>Type</span><div>{itemDetails?.type ? getItemTypeLabel(itemDetails.type) : '-'}</div></div>
                <div><span style={{fontWeight: 500}}>Status</span><div>{itemDetails?.status ? <StatusBadge type="status" value={itemDetails.status} /> : '-'}</div></div>
                <div><span style={{fontWeight: 500}}>Priority</span><div>{itemDetails?.priority ? <StatusBadge type="priority" value={itemDetails.priority} /> : '-'}</div></div>
                {itemDetails?.type !== 'epic' && <div><span style={{fontWeight: 500}}>Sprint</span><div>{itemDetails?.sprint || '-'}</div></div>}
                <div><span style={{fontWeight: 500}}>Size</span><div>{itemDetails?.size || '-'}</div></div>
              </div>
            </div>

            <div style={{marginBottom: 24}}>
              <h3 style={{fontWeight: 600, fontSize: '1rem', marginBottom: 12}}>Description</h3>
              <div style={{color: '#444', fontSize: '0.97rem'}}>{itemDetails?.description || 'No description provided.'}</div>
            </div>

            {itemDetails?.acceptanceCriteria && itemDetails.acceptanceCriteria.length > 0 && (
              <div style={{marginBottom: 24}}>
                <h3 style={{fontWeight: 600, fontSize: '1rem', marginBottom: 12}}>Acceptance Criteria</h3>
                <ul style={{paddingLeft: 20, color: '#444'}}>
                  {itemDetails.acceptanceCriteria.map((criterion, idx) => <li key={idx}>{criterion}</li>)}
                </ul>
              </div>
            )}

            <div style={{marginBottom: 24}}>
              <h3 style={{fontWeight: 600, fontSize: '1rem', marginBottom: 12}}>Assignment</h3>
              <div>
                <span style={{fontWeight: 500}}>Assignee</span>
                <div>
                  {assignee ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <AvatarDisplay user={{name: assignee.nickname || assignee.name || `User ${assignee.userId}`, profilePicture: assignee.profilePicture}} size="sm" />
                      <span>{assignee.nickname || (assignee.name ? assignee.name.split(' ')[0] : `User ${assignee.userId}`)}</span>
                    </div>
                  ) : (
                    'Unassigned'
                  )}
                </div>
              </div>
            </div>

            {linkedEpic && (
              <div style={{marginBottom: 24}}>
                <h3 style={{fontWeight: 600, fontSize: '1rem', marginBottom: 12}}>Linked Epic</h3>
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <Link2 size={16} />
                  <span>{linkedEpic.name}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ItemDetailsModal;
