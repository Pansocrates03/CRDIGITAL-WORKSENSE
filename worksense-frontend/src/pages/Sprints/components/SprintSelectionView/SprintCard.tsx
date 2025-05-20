import React from "react";
import "./SprintSelectionView.css";

type SprintCardProps = {
  title: string;
  description: string;
  status: "Planned" | "Active" | "Completed" | "No status";
  startDate: string;
  endDate: string;
  isSelected?: boolean;
};

const SprintCard: React.FC<SprintCardProps> = ({
  title,
  description,
  status,
  startDate,
  endDate,
  isSelected = false
}) => {
  const cardClass = `sprint-card${isSelected ? " sprint-card--active" : ""}`;
  const statusClass =
    "status-badge" +
    (status === "Active"
      ? " status-active"
      : status === "Completed"
      ? " status-completed"
      : "");

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
    </div>
  );
};

export default SprintCard;
