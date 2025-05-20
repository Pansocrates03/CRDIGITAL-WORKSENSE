import React from 'react';
import { Sprint } from '@/types/SprintType';
import SprintCard from './SprintCard'; // Adjust path as needed
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

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp._seconds) return "N/A";
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString();
  };

  return (
    <div className="sprint-selection">
      <h1 className="sprint-selection__title">Select a Sprint</h1>
      <div className="sprint-selection__grid">
        {sprints.map((sprint) => (
          <div
            key={sprint.id}
            onClick={() => onSelectSprint(sprint.id)}
            style={{ cursor: 'pointer' }}
          >
            <SprintCard
              title={sprint.name}
              description={sprint.goal || 'No goal defined'}
              status={sprint.status ?? 'No status'}
              startDate={formatDate(sprint.startDate)}
              endDate={formatDate(sprint.endDate)}
              isSelected={sprint.id === selectedSprintId}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SprintSelectionView;
