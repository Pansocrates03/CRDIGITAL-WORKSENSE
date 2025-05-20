import React from 'react';
import { Sprint } from '@/types/SprintType';
import './SprintSelectionView.css';

interface SprintSelectionViewProps {
  sprints: Sprint[] | undefined;
  selectedSprintId: string;
  onSelectSprint: (id: string) => void;
}

const SprintSelectionView: React.FC<SprintSelectionViewProps> = ({
  sprints,
  selectedSprintId,
  onSelectSprint
}) => {
  if (!sprints) return <p>No sprints available.</p>;
  
  // Updated formatDate function
  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp._seconds) return "N/A";
    
    // Convert the timestamp to a JavaScript Date object
    const date = new Date(timestamp._seconds * 1000); // Multiply by 1000 to convert seconds to milliseconds
    
    // Return the formatted date
    return date.toLocaleDateString();
  };

  return (
    <div className="sprint-selection">
      <h2 className="sprint-selection__title">Select a Sprint</h2>
      <div className="sprint-selection__grid">
        {sprints.map((sprint) => (
          <div
            key={sprint.id}
            className={`sprint-card ${sprint.id === selectedSprintId ? 'sprint-card--active' : ''}`}
            onClick={() => onSelectSprint(sprint.id)}
          >
            <h3 className="sprint-card__title">{sprint.name}</h3>
            <p className="sprint-card__goal">{sprint.goal || 'No goal defined'}</p>
            <div className="sprint-card__dates">
                <p><strong>Start:</strong> {formatDate(sprint.startDate)}</p>
                <p><strong>End:</strong> {formatDate(sprint.endDate)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SprintSelectionView;
