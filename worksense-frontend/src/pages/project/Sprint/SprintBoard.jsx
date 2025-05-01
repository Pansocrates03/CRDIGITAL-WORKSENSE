import React, { useState } from "react";
//import TaskBoard from "./TaskBoard";
import { initialBoardData } from "./data"; // Import the data
//import "./TaskBoardPage.css"; // Add styles later

function SprintBoardPage() {
  // Initialize state with the imported data
  const [boardData, setBoardData] = useState(initialBoardData);

  // Rest of the component...
  return (
    <div className="task-board-page">
      {/* Basic header elements for context */}
      <h1>Tasks</h1>
      <p>Short description will be placed here</p>
      {/* TODO: Add real header/tabs later */}

      <TaskBoard columns={boardData} />
    </div>
  );
}

export default SprintBoardPage;
