import React, { useState } from 'react';
import DraggableTaskCard from '../TaskCard/DraggableTaskCard';
import { Task } from '../../data';
import '../styles/BoardView.css';

interface BoardViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, newStatus: string) => void;
}

const BoardView: React.FC<BoardViewProps> = ({ tasks, onTaskUpdate }) => {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const columns = [
    { id: 'sprint_backlog', title: 'Sprint Backlog' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'in_review', title: 'In Review' },
    { id: 'done', title: 'Done' }
  ];

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onTaskUpdate(taskId, targetStatus);
    setDragOverColumn(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="board-view">
      {columns.map(column => (
        <div
          key={column.id}
          className="board-column"
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <h3 className="board-column__title">{column.title}</h3>
          <div className={`board-column__dropzone ${
            dragOverColumn === column.id ? 'board-column__dropzone--active' : ''
          }`}>
            <div className="board-column__tasks">
              {getTasksByStatus(column.id).map((task, index) => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoardView; 