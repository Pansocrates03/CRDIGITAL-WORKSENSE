// src/components/Meetings/QuickMeetingModal.tsx
import React, { FC, useState } from "react";
import { X, Zap, Users, FileText } from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import apiClient from "@/api/apiClient";
import styles from "./CreateMeetingModal.module.css"; // Reuse the same styles
import { toast } from "sonner";

interface QuickMeetingModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated: () => void;
}

interface QuickFormData {
  title: string;
  attendees: number[];
}

const QuickMeetingModal: FC<QuickMeetingModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onMeetingCreated,
}) => {
  const [formData, setFormData] = useState<QuickFormData>({
    title: "",
    attendees: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the existing useMembers hook
  const { data: members = [], isLoading: membersLoading } = useMembers(
    projectId,
    { enabled: !!projectId && isOpen }
  );

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setFormData({
        title: `Quick Meeting - ${now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        attendees: [],
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      // Add 2 minutes to ensure the meeting is in the future
      now.setMinutes(now.getMinutes() + 2);

      const meetingData = {
        title: formData.title.trim(),
        description: "Quick meeting started immediately",
        scheduledDate: now.toISOString(),
        duration: 40, // Fixed duration
        attendees: formData.attendees,
      };

      const response = await apiClient.post(
        `/projects/${projectId}/meetings`,
        meetingData
      );
      const meeting = response.data.meeting;

      onMeetingCreated();
      onClose();
      toast.success("Quick meeting created!");

      // Automatically open the meeting
      if (meeting.zoomJoinUrl) {
        window.open(meeting.zoomJoinUrl, "_blank");
      }
    } catch (error: any) {
      console.error("Error creating quick meeting:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create quick meeting";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof QuickFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAttendeeToggle = (userId: number) => {
    const isSelected = formData.attendees.includes(userId);

    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        attendees: prev.attendees.filter((id) => id !== userId),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        attendees: [...prev.attendees, userId],
      }));
    }
  };

  const selectAllMembers = () => {
    const allMemberIds = members.map((member) => member.userId);
    setFormData((prev) => ({
      ...prev,
      attendees: allMemberIds,
    }));
  };

  const clearAllMembers = () => {
    setFormData((prev) => ({
      ...prev,
      attendees: [],
    }));
  };

  // Helper function to display member name
  const getMemberDisplayName = (member: any) => {
    if (member.fullName) return member.fullName;
    if (member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName}`;
    }
    if (member.name) return member.name;
    return `User ${member.userId}`;
  };

  // Helper function to format role names properly
  const formatRoleName = (roleName: string): string => {
    if (!roleName) return "Member";
    return roleName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Helper function to display member role
  const getMemberRole = (member: any) => {
    if (member.roleName) return formatRoleName(member.roleName);
    if (member.projectRoleId) return formatRoleName(member.projectRoleId);
    return "Member";
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ maxWidth: "500px" }}>
        <div className={styles.header}>
          <div className={styles.quickHeaderTitle}>
            <Zap size={24} className={styles.quickIcon} />
            <h2 className={styles.title}>Start Quick Meeting</h2>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.scrollableContent}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FileText size={16} />
                Meeting Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={styles.input}
                placeholder="Enter meeting title"
                maxLength={100}
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FileText size={16} />
                Duration
              </label>
              <div className={styles.durationDisplay}>
                40 minutes (Standard meeting duration)
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.attendeesHeader}>
                <label className={styles.label}>
                  <Users size={16} />
                  Invite Attendees ({formData.attendees.length} selected)
                </label>
                {members.length > 0 && (
                  <div className={styles.attendeesActions}>
                    <button
                      type="button"
                      onClick={selectAllMembers}
                      className={styles.selectAllButton}
                      disabled={formData.attendees.length === members.length}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={clearAllMembers}
                      className={styles.clearAllButton}
                      disabled={formData.attendees.length === 0}
                    >
                      None
                    </button>
                  </div>
                )}
              </div>

              <div
                className={styles.attendeesList}
                style={{ maxHeight: "180px" }}
              >
                {membersLoading ? (
                  <div className={styles.loadingMembers}>
                    <div className={styles.memberLoadingSpinner}></div>
                    <span>Loading members...</span>
                  </div>
                ) : members.length > 0 ? (
                  members.map((member) => (
                    <div
                      key={member.userId}
                      className={`${styles.attendeeItem} ${
                        formData.attendees.includes(member.userId)
                          ? styles.attendeeSelected
                          : ""
                      }`}
                      onClick={() => handleAttendeeToggle(member.userId)}
                    >
                      <div className={styles.attendeeInfo}>
                        <div className={styles.attendeeName}>
                          {getMemberDisplayName(member)}
                        </div>
                        <div className={styles.attendeeRole}>
                          {getMemberRole(member)}
                        </div>
                      </div>
                      <div className={styles.attendeeCheckbox}>
                        <input
                          type="checkbox"
                          checked={formData.attendees.includes(member.userId)}
                          onChange={() => {}} // Handled by parent onClick
                          readOnly
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noMembers}>
                    No team members to invite
                  </div>
                )}
              </div>
            </div>

            <div className={styles.quickMeetingNotice}>
              <strong>Quick Meeting:</strong> This meeting will start in 2
              minutes and open automatically.
            </div>
          </form>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.quickSubmitButton}
            onClick={handleSubmit}
            disabled={isSubmitting || membersLoading}
          >
            {isSubmitting ? "Creating..." : "Start Meeting Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickMeetingModal;
