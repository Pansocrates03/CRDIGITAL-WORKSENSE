import React, { useState } from 'react';
import DraggableTaskCard from '../TaskCard/DraggableTaskCard';
import './BoardView.css';
import { Ticket } from '@/types/TicketType';

const BASE_COLUMN_TITLE = "Sprint Backlog (default)";

interface BoardViewProps {
  tickets: Ticket[];
  onTicketUpdate: (ticket:Ticket) => void
  columns: string[]
}

const BoardView: React.FC<BoardViewProps> = ({ tickets, onTicketUpdate, columns }) => {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const columnsWithBase = [BASE_COLUMN_TITLE, ...columns];

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
    
    // Find the ticket being moved
    const ticketToUpdate = tickets.find(ticket => ticket.id === taskId);
    if (!ticketToUpdate) return;

    // Create updated ticket with new status
    const updatedTicket = {
      ...ticketToUpdate,
      status: targetStatus === BASE_COLUMN_TITLE ? "" : targetStatus
    };

    // Update the ticket
    onTicketUpdate(updatedTicket);
    setDragOverColumn(null);
  };

  const getTasksByStatus = (status: string) => {
    if (status === BASE_COLUMN_TITLE) {
      return tickets.filter(ticket => !columns.includes(ticket.status || ""));
    }
    return tickets.filter(ticket => ticket.status === status);
  };

  return (
    <div className="board-view">
      {columnsWithBase.map(column => (
        <div
          key={column}
          className="board-column"
          onDragOver={(e) => handleDragOver(e, column)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column)}
        >
          <h3 className="board-column__title">{column}</h3>
          <div className={`board-column__dropzone ${
            dragOverColumn === column ? 'board-column__dropzone--active' : ''
          }`}>
            <div className="board-column__tasks">
              {getTasksByStatus(column).map((task, index) => (
                <DraggableTaskCard
                  key={task.id}
                  ticket={task}
                  index={index}
                  onUpdate={onTicketUpdate}
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