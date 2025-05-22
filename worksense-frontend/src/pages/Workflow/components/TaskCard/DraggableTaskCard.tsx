import React, { useState } from 'react';
import './TaskCard.css';
import BacklogItemType from '@/types/BacklogItemType';
import { Button } from '@/components/ui/button';
import { FaAngleDown, FaAngleUp, FaPlus } from "react-icons/fa";
import Modal from '@/components/Modal/Modal';
import { Input } from '@/components/ui/input';

interface DraggableTaskCardProps {
  task: BacklogItemType;
  index: number;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ task, index }) => {
  const [showSubtasks, setShowSubtasks] = useState(false);

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

      <div className="task-card__footer">
        <span style={{fontSize: 12}}>
          Tasks: {task.subItems ? task.subItems.length : 0}
        </span>
        <button
          type="button"
          onClick={() => setShowSubtasks((prev) => !prev)}
          className='task-card__toggle-subtasks'
          aria-label={showSubtasks ? "Ocultar subtasks" : "Mostrar subtasks"}
        >
          {showSubtasks ? <FaAngleUp size={16} /> : <FaAngleDown size={16} />}
        </button>
      </div>

{showSubtasks && (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <FaPlus />
      <form onSubmit={(e) => {
        e.preventDefault();
        (e.target as HTMLFormElement).reset();

      }}>
      <Input
        type="text"
        placeholder="Add task"
        className="task-card__search"
        />
        </form>
    </div>

    {task.subItems && task.subItems.length > 0 && (
      <ul className="task-card__subitems">
        {task.subItems.map((sub, idx) => (
          <li key={sub.id ?? idx} className="task-card__subitem">
            {sub.name}
          </li>
        ))}
      </ul>
    )}
  </>
)}

    </div>
  );
};

export default DraggableTaskCard;