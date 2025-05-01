import React from "react";
import TaskCard from "../TaskCard/TaskCard"; // Assuming TaskCard_v2.jsx was renamed or this is the correct one
import "./TaskColumn.css"; // Create a corresponding CSS file

// Icons from react-icons
// npm install react-icons
import { FiPlus, FiMoreHorizontal } from "react-icons/fi";

// --- TaskColumn Component ---
function TaskColumn({ title = "Unnamed Column", tasks = [] }) {
  // Add default props

  const taskCount = tasks.length;

  return (
    <div className="task-column">
      {/* Column Header */}
      <div className="task-column__header">
        <div className="task-column__title-group">
          <h3 className="task-column__title">{title}</h3>
          {taskCount > 0 && ( // Only show count if > 0
            <span className="task-column__count">{taskCount}</span>
          )}
        </div>
        <div className="task-column__actions">
          <button
            className="task-column__action-btn"
            aria-label={`Add task to ${title}`}
          >
            <FiPlus size={16} /> {/* Adjusted icon size slightly */}
          </button>
          <button
            className="task-column__action-btn"
            aria-label={`More options for ${title}`}
          >
            <FiMoreHorizontal size={16} /> {/* Adjusted icon size slightly */}
          </button>
        </div>
      </div>

      {/* Column Body - Task List */}
      <div className="task-column__body">
        {tasks.length === 0 ? (
          <div className="task-column__empty-message">
            {/* Optional: Add a visual cue or just text */}
            <span>No tasks here yet.</span>
          </div>
        ) : (
          // Map over the tasks array
          tasks.map((task) => (
            // Render a TaskCard for each task, passing the task data
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}

export default TaskColumn;
