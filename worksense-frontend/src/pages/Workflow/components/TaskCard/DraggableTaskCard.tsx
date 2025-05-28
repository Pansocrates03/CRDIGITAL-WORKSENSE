import React, { FormEvent, useRef, useState } from 'react';
import './TaskCard.css';
import { FaAngleDown, FaAngleUp, FaPlus, FaCircle, FaCheckCircle } from "react-icons/fa";
import { Input } from '@/components/ui/input';
import { Ticket } from '@/types/TicketType';

interface DraggableTaskCardProps {
  ticket: Ticket;
  index: number;
  onUpdate?: (ticket:Ticket) => void
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ ticket, index, onUpdate }) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [currentItem, setCurrentItem] = useState<Ticket>(ticket);
  const formRef = useRef<HTMLFormElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', currentItem.id);
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

  // Used when a new task is created
  const handleAddTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const taskName = data.taskName as string;

    if (!taskName?.trim()) return;

    const updatedItem: Ticket = {
      ...currentItem,
      tasks: [...(currentItem.tasks || []), {isFinished: false, name: taskName}]
    };
    
    setCurrentItem(updatedItem);
    if (onUpdate) {
      onUpdate(updatedItem);
    }

    // Reset form using the ref
    formRef.current?.reset();
  };

  const handleToggleTaskCompletion = (taskIndex: number) => {
    const updatedTasks = [...(currentItem.tasks || [])];
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      isFinished: !updatedTasks[taskIndex].isFinished
    };

    const updatedItem = {
      ...currentItem,
      tasks: updatedTasks
    };

    setCurrentItem(updatedItem);
    if (onUpdate) {
      onUpdate(updatedItem);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="task-card"
    >      
      <h3 className="task-card__title">{currentItem.name}</h3>
      
      <div className="task-card__meta">
        <span className={`task-card__status ${getStatusClass(currentItem.status ? currentItem.status : "")}`}>
          {currentItem.status.length <= 0 ? "Sprint Backlog" : currentItem.status}
        </span>
        {currentItem.priority && (
          <span className={`task-card__priority ${getPriorityClass(currentItem.priority)}`}>
            {currentItem.priority}
          </span>
        )}
      </div>

      <div className="task-card__footer">
        <span style={{fontSize: 12}}>
          Completed Tasks: {currentItem.tasks ? currentItem.tasks.filter(t => t.isFinished == true).length : 0}/{currentItem.tasks ? currentItem.tasks.length : 0}
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

      {/* Show tasks */}
      {showSubtasks && (
        <>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            marginTop: '1rem',
            width: '100%'
          }}>
            <FaPlus />
            <form ref={formRef} onSubmit={handleAddTask} style={{ flex: 1 }}>
              <Input
                type="text"
                name="taskName"
                placeholder="Add task"
                className="task-card__search"
              />
            </form>
          </div>

          {currentItem.tasks && currentItem.tasks.length > 0 && (
            <ul className="task-card__subitems">
              {currentItem.tasks.map((task, idx) => (
                <li key={idx} className="task-card__subitem">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleTaskCompletion(idx)}
                      className={`task-card__completion-btn ${task.isFinished ? 'task-card__completion-btn--completed' : ''}`}
                      aria-label={task.isFinished ? "Marcar como no completada" : "Marcar como completada"}
                    >
                      {task.isFinished ? <FaCheckCircle size={16} /> : <FaCircle size={16} />}
                    </button>
                    <span style={{ 
                      textDecoration: task.isFinished ? 'line-through' : 'none',
                      color: task.isFinished ? '#6b7280' : '#374151'
                    }}>
                      {task.name}
                    </span>
                  </div>
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