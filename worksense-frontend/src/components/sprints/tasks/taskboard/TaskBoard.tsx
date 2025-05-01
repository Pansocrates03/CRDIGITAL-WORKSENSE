// src/components/sprints/tasks/taskboard/TaskBoard.tsx

import React from "react";
import TaskColumn from "../taskcolumn/TaskColumn"; // Adjust path if needed
import { Task } from "@/types/Task"; // Adjust path if needed
import "./TaskBoard.css"; // Ensure this CSS file exists

// Define the shape of a column object expected by the board
// This should match the output of transformTasksToBoardData in SprintPage
interface BoardColumn {
  id: string; // Status ID (e.g., "ToDo", "InProgress") used as key and columnId
  title: string;
  tasks: Task[];
}

interface TaskBoardProps {
  columns: BoardColumn[]; // Expect an array of column objects structured correctly
}

function TaskBoard({ columns = [] }: TaskBoardProps) {
  if (!Array.isArray(columns) || columns.length === 0) {
    return (
      <div className="task-board task-board--empty">
        No columns defined or tasks loaded.
      </div>
    );
  }

  return (
    <div className="task-board">
      {/* Map over the columns array received from SprintPage */}
      {columns.map((column) => (
        // For each column object, render a TaskColumn component
        <TaskColumn
          key={column.id} // Use unique status ID as key
          // *** THIS IS THE CRUCIAL PROP ***
          // Pass the column's ID (which is the status ID like "ToDo", "InProgress")
          // This ID will be used as the droppableId inside TaskColumn
          columnId={column.id}
          // Pass the column title
          title={column.title}
          // Pass the array of tasks belonging to this column
          tasks={column.tasks}
        />
      ))}
      {/* Optional: Add a placeholder or button to add a new column */}
      {/* <div className="add-column-placeholder"> + Add another list </div> */}
    </div>
  );
}

export default TaskBoard;
