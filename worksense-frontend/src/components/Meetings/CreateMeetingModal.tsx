// src/components/Meetings/CreateMeetingModal.tsx
import React, { FC, useState } from "react";
import { X, Calendar, Clock, Users, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import styles from "./CreateMeetingModal.module.css";
import { toast } from "sonner";

interface CreateMeetingModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated: () => void;
}

interface Member {
  userId: number;
  name?: string;
  fullName?: string;
  email?: string;
  projectRoleId?: string;
  roleName?: string;
}

interface FormData {
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  attendees: number[];
}

const CreateMeetingModal: FC<CreateMeetingModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onMeetingCreated,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    attendees: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch project members
  const { data: members = [] } = useQuery({
    queryKey: ["members", projectId],
    queryFn: async () => {
      const res = await apiClient.get(`/projects/${projectId}/members`);
      return res.data;
    },
    enabled: !!projectId && isOpen,
  });

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      // Set default date to today
      const today = new Date();

      setFormData({
        title: "",
        description: "",
        scheduledDate: today.toISOString().split("T")[0],
        scheduledTime: "10:00",
        duration: 60,
        attendees: [],
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Meeting title is required";
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = "Meeting date is required";
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = "Meeting time is required";
    }

    if (formData.duration < 15 || formData.duration > 480) {
      newErrors.duration = "Duration must be between 15 minutes and 8 hours";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        duration: formData.duration,
        attendees: formData.attendees,
      };

      await apiClient.post(`/projects/${projectId}/meetings`, meetingData);

      onMeetingCreated();
      onClose();
      toast.success("Meeting scheduled successfully!");
    } catch (error: any) {
      console.error("Error creating meeting:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create meeting";
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

  const getDurationOptions = () => {
    const options = [];

    // 15, 30, 45 minutes
    for (let i = 15; i < 60; i += 15) {
      options.push({ value: i, label: `${i} minutes` });
    }

    // 1-8 hours
    for (let i = 1; i <= 8; i++) {
      options.push({ value: i * 60, label: `${i} hour${i > 1 ? "s" : ""}` });
    }

    return options;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Schedule New Meeting</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            <X size={24} />
          </button>
        </div>

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
              onChange={(e) => handleInputChange("description", e.target.value)}
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
              />
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
              {errors.scheduledTime && (
                <span className={styles.error}>{errors.scheduledTime}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Clock size={16} />
              Duration *
            </label>
            <select
              value={formData.duration}
              onChange={(e) =>
                handleInputChange("duration", parseInt(e.target.value))
              }
              className={`${styles.select} ${
                errors.duration ? styles.inputError : ""
              }`}
            >
              {getDurationOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.duration && (
              <span className={styles.error}>{errors.duration}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Users size={16} />
              Attendees ({formData.attendees.length} selected)
            </label>
            <div className={styles.attendeesList}>
              {members.length > 0 ? (
                members.map((member: Member) => (
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
                        {member.fullName ||
                          member.name ||
                          `User ${member.userId}`}
                      </div>
                      {member.email && (
                        <div className={styles.attendeeEmail}>
                          {member.email}
                        </div>
                      )}
                      {member.roleName && (
                        <div className={styles.attendeeRole}>
                          {member.roleName}
                        </div>
                      )}
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
                  No team members found. Add members to your project to invite
                  them to meetings.
                </div>
              )}
            </div>
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
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
