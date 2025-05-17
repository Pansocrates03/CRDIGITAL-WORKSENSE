import React, { useState } from 'react';
import DraggableTaskCard from '../TaskCard/DraggableTaskCard';
import '../styles/BoardView.css';
import BacklogItemType from '@/types/BacklogItemType';

interface BoardViewProps {
  tasks: BacklogItemType[];
  onTaskUpdate: (taskId: string, newStatus: string) => void;
  columns: {id: string, title: string}[]
}

const BoardView: React.FC<BoardViewProps> = ({ tasks, onTaskUpdate, columns }) => {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
   

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