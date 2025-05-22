import React from 'react';
import { Task } from '../../data';
import '../styles/TaskCard.css';
import BacklogItemType from '@/types/BacklogItemType';

interface DraggableTaskCardProps {
  task: BacklogItemType;
  index: number;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ task, index }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('sourceIndex', index.toString());
    e.currentTarget.classList.add('task-card--dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('task-card--dragging');
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'sprint_backlog':
        return 'task-card__status--backlog';
      case 'in_progress':
        return 'task-card__status--progress';
      case 'in_review':
        return 'task-card__status--review';
      case 'done':
        return 'task-card__status--done';
      default:
        return '';
    }
  };

  const getPriorityClass = (priority: string | null) => {
    if (!priority) return '';
    switch (priority) {
      case 'P1':
        return 'task-card__priority--p1';
      case 'P2':
        return 'task-card__priority--p2';
      case 'P3':
        return 'task-card__priority--p3';
      default:
        return '';
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="task-card"
    >
      {task.coverImage && (
        <div className="task-card__cover">
          <img
            src={task.coverImage}
            alt={task.name ? task.name : "NaN"}
            className="task-card__cover-image"
          />
        </div>
      )}
      
      <h3 className="task-card__title">{task.name}</h3>
      
      <div className="task-card__meta">
        <span className={`task-card__status ${getStatusClass(task.status ? task.status : "")}`}>
          {task.status}
        </span>
        
        {task.priority && (
          <span className={`task-card__priority ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>
        )}
      </div>

      {task.subItems && task.subItems.length < 0 && (
        <div className="task-card__progress">
          <div className="task-card__progress-bar">
            <div
              className="task-card__progress-fill"
              style={{ width: `${(10 / 30 ) * 100}%` }} // subtasks completed / total subtasks
            />
          </div>
          <span className="task-card__progress-text">
            {10}/{30} // 
          </span>
        </div>
      )}

      <div className="task-card__footer">
        <div className="task-card__assignees">
          
          {/*task.assignees.map(assignee => (
            <img
              key={assignee.id}
              className="task-card__assignee"
              src={assignee.avatarUrl}
              alt={assignee.name}
              title={assignee.name}
            />
          ))*/}
        </div>
        
        {/* 
        <div className="task-card__stats">
          {task.commentsCount > 0 && (
            <span>💬 {task.commentsCount}</span>
          )}
          {task.linksCount > 0 && (
            <span>🔗 {task.linksCount}</span>
          )}
        </div>
        */}
      </div>
    </div>
  );
};

export default DraggableTaskCard; 