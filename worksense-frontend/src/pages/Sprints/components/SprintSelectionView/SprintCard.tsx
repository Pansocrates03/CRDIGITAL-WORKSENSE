import React from "react";
import "./SprintSelectionView.css";
import { FiTrash2, FiPenTool } from "react-icons/fi";

type SprintCardProps = {
  title: string;
  description: string;
  status: "Planned" | "Active" | "Completed" | "No status";
  startDate: string;
  endDate: string;
  isSelected?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

const SprintCard: React.FC<SprintCardProps> = ({
  title,
  description,
  status,
  startDate,
  endDate,
  isSelected = false,
  onEdit,
  onDelete
}) => {
  const cardClass = `sprint-card${isSelected ? " sprint-card--active" : ""}`;
  const statusClass =
    "status-badge" +
    (status === "Active"
      ? " status-active"
      : status === "Completed"
      ? " status-completed"
      : "");

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(); // This will trigger the delete function passed as a prop
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(); // This will trigger the edit function passed as a prop
    }
  };

  return (
    <div className={cardClass}>
      <div className="sprint-cardHeader">
        <div className="sprint-cardTitleArea">
          <h4>{title}</h4>
        </div>
        <div className={statusClass}>{status}</div>
      </div>
      <p className="sprint-cardDescription">{description}</p>
      <div className="sprint-card__dates">
        <p><strong>Start:</strong> {startDate}</p>
        <p><strong>End:</strong> {endDate}</p>
      </div>
      
      <div className="sprint-card__action-buttons">
        <button
          className="sprint-card__edit-btn"
          title="Edit"
          onClick={handleEditClick}  // Calling the edit function
        >
          <FiPenTool />
        </button>

        <button
          className="sprint-card__trash-btn"
          title="Delete"
          onClick={handleDeleteClick} // Calling the delete function
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
};

export default SprintCard;
