import React from "react";
import TaskColumn from "../TaskColumn/TaskColumn"; // Import the TaskColumn component
import "./TaskBoard.css"; // Create a corresponding CSS file

// --- TaskBoard Component ---
function TaskBoard({ columns = [] }) {
  // Expect an array of column objects

  if (!Array.isArray(columns) || columns.length === 0) {
    return (
      <div className="task-board task-board--empty">
        No columns to display. Please add some columns to the board.
      </div>
    );
  }

  return (
    <div className="task-board">
      {/* Map over the columns array */}
      {columns.map((column) => (
        // For each column object, render a TaskColumn component
        <TaskColumn
          key={column.id} // Use the unique column ID as the key
          title={column.title} // Pass the column title
          tasks={column.tasks} // Pass the array of tasks for this column
        />
      ))}
      {/* Optional: Add a placeholder or button to add a new column */}
      {/* <div className="add-column-placeholder"> + Add another list </div> */}
    </div>
  );
}

export default TaskBoard;
