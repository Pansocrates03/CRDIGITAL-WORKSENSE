// src/components/Meetings/CreateMeetingModal.tsx
import React, { FC, useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Users,
  FileText,
  Repeat,
  Edit2,
} from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/apiClient";
import styles from "./CreateMeetingModal.module.css";
import { toast } from "sonner";

interface Meeting {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  scheduledDate: {
    _seconds: number;
    _nanoseconds: number;
  };
  duration: number;
  zoomMeetingId?: string;
  zoomJoinUrl?: string;
  zoomPassword?: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  createdBy: number;
  attendees?: number[];
  transcript?: string;
  summary?: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface CreateMeetingModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated: () => void;
  editMeeting?: Meeting | null; // Optional meeting to edit
  mode?: "create" | "edit"; // Mode to determine behavior
}

interface FormData {
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  attendees: number[];
  isRecurring: boolean;
  recurrencePattern: {
    frequency: "weekly";
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
    endDate?: string;
  };
}

const CreateMeetingModal: FC<CreateMeetingModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onMeetingCreated,
  editMeeting,
  mode = "create",
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "10:00",
    attendees: [],
    isRecurring: false,
    recurrencePattern: {
      frequency: "weekly",
      daysOfWeek: [],
      endDate: undefined,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Use the existing useMembers hook
  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError,
  } = useMembers(projectId, { enabled: !!projectId && isOpen });

  // Helper function to convert Firestore timestamp to Date
  const timestampToDate = (timestamp: {
    _seconds: number;
    _nanoseconds: number;
  }) => {
    return new Date(timestamp._seconds * 1000);
  };

  // Reset form when modal opens/closes or when editMeeting changes
  React.useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && editMeeting) {
        // Pre-populate form with meeting data for editing
        const meetingDate = timestampToDate(editMeeting.scheduledDate);
        const dateStr = meetingDate.toISOString().split("T")[0];
        const timeStr = meetingDate.toTimeString().slice(0, 5);

        setFormData({
          title: editMeeting.title,
          description: editMeeting.description || "",
          scheduledDate: dateStr,
          scheduledTime: timeStr,
          attendees: editMeeting.attendees || [],
          isRecurring: false, // Disable recurring for edit mode for now
          recurrencePattern: {
            frequency: "weekly",
            daysOfWeek: [],
            endDate: undefined,
          },
        });
      } else {
        // Set default data for creation
        const now = new Date();

        // Set default end date to 1 month from now
        const defaultEndDate = new Date(now);
        defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);

        // Format current time to HH:MM
        const currentTimeStr = now.toTimeString().slice(0, 5);

        // Format current date to YYYY-MM-DD in local timezone
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const currentDateStr = `${year}-${month}-${day}`;

        // Format end date to YYYY-MM-DD in local timezone
        const endYear = defaultEndDate.getFullYear();
        const endMonth = String(defaultEndDate.getMonth() + 1).padStart(2, "0");
        const endDay = String(defaultEndDate.getDate()).padStart(2, "0");
        const endDateStr = `${endYear}-${endMonth}-${endDay}`;

        setFormData({
          title: "",
          description: "",
          scheduledDate: currentDateStr,
          scheduledTime: currentTimeStr,
          attendees: [],
          isRecurring: false,
          recurrencePattern: {
            frequency: "weekly",
            daysOfWeek: [],
            endDate: endDateStr,
          },
        });
      }
      setErrors({});
    }
  }, [isOpen, editMeeting, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Meeting title is required";
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = "Meeting date is required";
    }

    if (!formData.scheduledTime || !isValidTime(formData.scheduledTime)) {
      newErrors.scheduledTime = "Please enter a valid time";
    }

    if (formData.scheduledDate && formData.scheduledTime) {
      // Check if the date is in the past (only for new meetings, not edits)
      if (mode === "create") {
        const selectedDateTime = new Date(
          `${formData.scheduledDate}T${formData.scheduledTime}`
        );
        const now = new Date();
        if (selectedDateTime <= now) {
          newErrors.scheduledDate = "Meeting must be scheduled for the future";
        }
      }
    }

    if (formData.isRecurring) {
      if (formData.recurrencePattern.daysOfWeek.length === 0) {
        newErrors.recurrence = "Please select at least one day of the week";
      }
      if (!formData.recurrencePattern.endDate) {
        newErrors.endDate = "Please select an end date for recurring meetings";
      }
      // Limit recurring meetings to prevent API rate limiting
      if (
        formData.recurrencePattern.daysOfWeek.length > 0 &&
        formData.recurrencePattern.endDate
      ) {
        const startDate = new Date(
          `${formData.scheduledDate}T${formData.scheduledTime}`
        );
        const endDate = new Date(formData.recurrencePattern.endDate);
        const daysDiff = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const estimatedMeetings =
          Math.floor(daysDiff / 7) *
          formData.recurrencePattern.daysOfWeek.length;

        if (estimatedMeetings > 50) {
          newErrors.endDate =
            "Too many meetings (max 50). Please choose a shorter period or fewer days.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidTime = (timeStr: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(timeStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledDateTime = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      const meetingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        scheduledDate: scheduledDateTime.toISOString(),
        duration: 40, // Fixed duration
        attendees: formData.attendees,
        isRecurring: mode === "create" ? formData.isRecurring : false, // No recurring for edits
        recurrencePattern:
          mode === "create" && formData.isRecurring
            ? formData.recurrencePattern
            : undefined,
      };

      if (mode === "edit" && editMeeting) {
        // Update existing meeting
        await apiClient.patch(`/meetings/${editMeeting.id}`, meetingData);
        toast.success("Meeting updated successfully!");
      } else {
        // Create new meeting
        if (formData.isRecurring) {
          // For recurring meetings, we'll need a new endpoint
          await apiClient.post(
            `/projects/${projectId}/meetings/recurring`,
            meetingData
          );
          toast.success("Recurring meetings scheduled successfully!");
        } else {
          await apiClient.post(`/projects/${projectId}/meetings`, meetingData);
          toast.success("Meeting scheduled successfully!");
        }
      }

      onMeetingCreated();
      onClose();
    } catch (error: any) {
      console.error(
        `Error ${mode === "edit" ? "updating" : "creating"} meeting:`,
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        `Failed to ${mode === "edit" ? "update" : "create"} meeting`;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRecurrencePatternChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      recurrencePattern: {
        ...prev.recurrencePattern,
        [field]: value,
      },
    }));

    if (errors.recurrence || errors.endDate) {
      setErrors((prev) => ({ ...prev, recurrence: "", endDate: "" }));
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    const currentDays = formData.recurrencePattern.daysOfWeek;
    const newDays = currentDays.includes(dayIndex)
      ? currentDays.filter((d) => d !== dayIndex)
      : [...currentDays, dayIndex].sort();

    handleRecurrencePatternChange("daysOfWeek", newDays);
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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === "edit" ? (
              <div className={styles.quickHeaderTitle}>
                <Edit2 size={24} className={styles.quickIcon} />
                Edit Meeting
              </div>
            ) : (
              "Schedule New Meeting"
            )}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={24} />
          </Button>
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
                className={`${styles.input} ${
                  errors.title ? styles.inputError : ""
                }`}
                placeholder="Enter meeting title"
                maxLength={100}
              />
              {errors.title && (
                <span className={styles.error}>{errors.title}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FileText size={16} />
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className={styles.textarea}
                placeholder="Optional meeting description or agenda"
                rows={3}
                maxLength={500}
              />
              <div className={styles.charCount}>
                {formData.description.length}/500
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Calendar size={16} />
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    handleInputChange("scheduledDate", e.target.value)
                  }
                  className={`${styles.input} ${
                    errors.scheduledDate ? styles.inputError : ""
                  }`}
                  min={
                    mode === "create"
                      ? new Date().toISOString().split("T")[0]
                      : undefined
                  }
                />
                <div className={styles.keyboardHint}>
                  Use ↑↓ arrows to adjust values, ←→ arrows to switch day/month/year
                </div>
                {errors.scheduledDate && (
                  <span className={styles.error}>{errors.scheduledDate}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Clock size={16} />
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) =>
                    handleInputChange("scheduledTime", e.target.value)
                  }
                  className={`${styles.input} ${
                    errors.scheduledTime ? styles.inputError : ""
                  }`}
                />
                <div className={styles.keyboardHint}>
                  Use ↑↓ arrows to adjust time, ←→ arrows to switch hour/minute
                </div>
                {errors.scheduledTime && (
                  <span className={styles.error}>{errors.scheduledTime}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Clock size={16} />
                Duration
              </label>
              <div className={styles.durationDisplay}>
                40 minutes (Standard meeting duration)
              </div>
            </div>

            {/* Recurring Meeting Section - Only show for create mode */}
            {mode === "create" && (
              <div className={styles.formGroup}>
                <div
                  className={styles.attendeeItem}
                  onClick={() =>
                    handleInputChange("isRecurring", !formData.isRecurring)
                  }
                  style={{
                    border: "1px solid var(--neutral-300, #e6e4e8)",
                    borderRadius: "var(--radius, 0.625rem)",
                    marginBottom: "1rem",
                    cursor: "pointer",
                  }}
                >
                  <div className={styles.attendeeInfo}>
                    <div className={styles.attendeeName}>
                      <Repeat size={16} style={{ marginRight: "0.5rem" }} />
                      Make this a recurring meeting
                    </div>
                    <div className={styles.attendeeEmail}>
                      Schedule multiple meetings automatically
                    </div>
                  </div>
                  <div className={styles.attendeeCheckbox}>
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={() => {}}
                      readOnly
                    />
                  </div>
                </div>

                {formData.isRecurring && (
                  <div className={styles.attendeesList}>
                    <div style={{ padding: "1rem" }}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Repeat on days</label>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {dayNames.map((day, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleDayToggle(index)}
                              className={styles.selectAllButton}
                              style={{
                                backgroundColor:
                                  formData.recurrencePattern.daysOfWeek.includes(
                                    index
                                  )
                                    ? "var(--color-purple, #ac1754)"
                                    : "white",
                                color:
                                  formData.recurrencePattern.daysOfWeek.includes(
                                    index
                                  )
                                    ? "white"
                                    : "var(--neutral-700, #4d4b51)",
                                minWidth: "45px",
                                borderColor:
                                  formData.recurrencePattern.daysOfWeek.includes(
                                    index
                                  )
                                    ? "var(--color-purple, #ac1754)"
                                    : "var(--neutral-300, #e6e4e8)",
                              }}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                        {errors.recurrence && (
                          <span className={styles.error}>
                            {errors.recurrence}
                          </span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>End date *</label>
                        <input
                          type="date"
                          value={formData.recurrencePattern.endDate}
                          onChange={(e) =>
                            handleRecurrencePatternChange(
                              "endDate",
                              e.target.value
                            )
                          }
                          className={`${styles.input} ${
                            errors.endDate ? styles.inputError : ""
                          }`}
                          min={formData.scheduledDate}
                        />
                        <div className={styles.keyboardHint}>
                          Use ↑↓ arrows to adjust values, ←→ arrows to switch day/month/year
                        </div>
                        {errors.endDate && (
                          <span className={styles.error}>{errors.endDate}</span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--color-accent, #176aac)",
                          backgroundColor: "var(--surface-light, #f4f7fa)",
                          padding: "0.75rem",
                          borderRadius: "var(--radius, 0.625rem)",
                          border:
                            "1px solid var(--surface-light-border, #e2e8f0)",
                          marginTop: "0.75rem",
                        }}
                      >
                        <strong>Note:</strong> Maximum 50 meetings can be
                        scheduled at once to prevent system overload.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.formGroup}>
              <div className={styles.attendeesHeader}>
                <label className={styles.label}>
                  <Users size={16} />
                  Attendees ({formData.attendees.length} selected)
                </label>
                {members.length > 0 && (
                  <div className={styles.attendeesActions}>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={selectAllMembers}
                      disabled={formData.attendees.length === members.length}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={clearAllMembers}
                      disabled={formData.attendees.length === 0}
                    >
                      Clear All
                    </Button>
                  </div>
                )}
              </div>

              <div className={styles.attendeesList}>
                {membersLoading ? (
                  <div className={styles.loadingMembers}>
                    <div className={styles.memberLoadingSpinner}></div>
                    <span>Loading team members...</span>
                  </div>
                ) : membersError ? (
                  <div className={styles.errorMembers}>
                    <span>Error loading team members. Please try again.</span>
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
                        {member.email && (
                          <div className={styles.attendeeEmail}>
                            {member.email}
                          </div>
                        )}
                        <div className={styles.attendeeRole}>
                          {getMemberRole(member)}
                        </div>
                      </div>
                      <div className={styles.attendeeCheckbox}>
                        <input
                          type="checkbox"
                          checked={formData.attendees.includes(member.userId)}
                          onChange={() => {}}
                          readOnly
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noMembers}>
                    No team members found. Add members to your project to invite
                    them to meetings.
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            <X size={16} style={{ marginRight: "0.5rem" }} />
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={isSubmitting || membersLoading}
          >
            <Calendar size={16} style={{ marginRight: "0.5rem" }} />
            {isSubmitting
              ? mode === "edit"
                ? "Updating..."
                : formData.isRecurring
                ? "Scheduling Recurring..."
                : "Scheduling..."
              : mode === "edit"
              ? "Update Meeting"
              : formData.isRecurring
              ? "Schedule Recurring Meetings"
              : "Schedule Meeting"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
