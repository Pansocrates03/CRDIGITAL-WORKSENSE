import React, { useState } from 'react';
import DraggableTaskCard from '../TaskCard/DraggableTaskCard';
import './BoardView.css';
import BacklogItemType from '@/types/BacklogItemType';

const BASE_COLUMN_ID = "New";
const BASE_COLUMN_TITLE = "Sin columna";

interface BoardViewProps {
  tasks: BacklogItemType[];
  onTaskUpdate: (taskId: string, newStatus: string) => void;
  onTaskContentUpdate: (taskkId: string, newTasks: {name: string, isFinished:boolean}[]) => void;
  columns: {id: string, title: string}[]
}

const BoardView: React.FC<BoardViewProps> = ({ tasks, onTaskUpdate, onTaskContentUpdate, columns }) => {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const columnsWithBase = [
    { id: BASE_COLUMN_ID, title: BASE_COLUMN_TITLE},
    ...columns
  ]

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

  const handleUpdateItem = (updatedItem: BacklogItemType) => {
    onTaskContentUpdate(updatedItem.id,updatedItem.tasks);
  };

  const getTasksByStatus = (status: string) => {
    if (status === BASE_COLUMN_ID) {
      const columnIds = columns.map(col => col.id);
      return tasks.filter(task => !columnIds.includes(task.status ? task.status : ""));
    }
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="board-view">
      {columnsWithBase.map(column => (
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
                  BacklogItem={task}
                  index={index}
                  onUpdate={handleUpdateItem}
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