// src/components/sprints/tasks/taskcolumn/TaskColumn.tsx

import React from "react";
import TaskCard from "../taskcard/TaskCard"; // Adjust path if needed
import { Task } from "@/types/Task"; // Adjust path if needed
import "./TaskColumn.css"; // Make sure this CSS file exists

// Icons from react-icons (ensure you've installed it: npm install react-icons)
import { FiPlus, FiMoreHorizontal } from "react-icons/fi";

// *** Import Droppable from react-beautiful-dnd ***
import { Droppable } from "react-beautiful-dnd";

interface TaskColumnProps {
  title: string; // Title of the column (e.g., "To Do", "In Progress")
  tasks: Task[]; // Array of task objects for this column
  columnId: string; // Unique ID for the column (should match the task status)
  // Optional: Add handlers for the '+' and '...' buttons if needed
  // onAddTask?: (columnId: string) => void;
  // onMoreOptions?: (columnId: string) => void;
}

function TaskColumn({
  title = "Unnamed Column", // Default title
  tasks = [], // Default empty array for tasks
  columnId, // columnId is now required
}: // onAddTask,             // Example handler prop
// onMoreOptions          // Example handler prop
TaskColumnProps) {
  const taskCount = tasks.length;

  const handleAddTaskClick = () => {
    console.log(`Add task clicked for column: ${columnId}`);
    // onAddTask?.(columnId); // Call prop if provided
  };

  const handleMoreOptionsClick = () => {
    console.log(`More options clicked for column: ${columnId}`);
    // onMoreOptions?.(columnId); // Call prop if provided
  };

  return (
    <div className="task-column">
      {/* Column Header */}
      <div className="task-column__header">
        <div className="task-column__title-group">
          <h3 className="task-column__title">{title}</h3>
          {taskCount > 0 && (
            <span className="task-column__count">{taskCount}</span>
          )}
        </div>
        {/* Action Buttons */}
        <div className="task-column__actions">
          <button
            className="task-column__action-btn"
            aria-label={`Add task to ${title}`}
            onClick={handleAddTaskClick} // Add onClick handler
          >
            <FiPlus size={16} />
          </button>
          <button
            className="task-column__action-btn"
            aria-label={`More options for ${title}`}
            onClick={handleMoreOptionsClick} // Add onClick handler
          >
            <FiMoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Column Body - Task List becomes the Droppable area */}
      {/* *** Wrap the task list area with Droppable *** */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            // Apply the ref and props to the body div
            ref={provided.innerRef}
            {...provided.droppableProps}
            // Apply dynamic class based on dragging state
            className={`task-column__body ${
              snapshot.isDraggingOver ? "task-column__body--dragging-over" : ""
            }`}
            // Ensure minimum height when empty for better drop targetting
            style={{ minHeight: tasks.length === 0 ? "80px" : "auto" }}
          >
            {/* Conditional Rendering for tasks or empty message */}
            {tasks.length === 0
              ? // Still show empty message, but area is droppable
                !snapshot.isDraggingOver && ( // Hide message while dragging over to avoid visual clutter
                  <div className="task-column__empty-message">
                    <span>No tasks here yet.</span>
                  </div>
                )
              : // Map over the tasks array
                tasks.map((task, index) => (
                  // Render a TaskCard for each task
                  <TaskCard
                    key={task.id} // React key
                    task={task} // Task data
                    index={index} // Index required by Draggable
                  />
                ))}
            {/* *** Render the placeholder *** */}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default TaskColumn;
