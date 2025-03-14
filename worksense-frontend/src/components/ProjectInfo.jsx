import React, { useState, useEffect } from "react";
import "../styles/global.css";

const API_BASE_URL = "http://localhost:5050";

const ProjectInfo = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/allprojects`);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Function to determine badge color based on status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#2ecc71"; // Green
      case "in progress":
        return "#f39c12"; // Yellow
      default:
        return "#e74c3c"; // Red for other statuses
    }
  };

  return (
    <div className="container">
      <h3 className="section-title">
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            className="project-icon"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "var(--secondary-color)",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            P
          </span>
          Project Information (SQL Database)
        </span>
      </h3>

      <div className="project-list" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              style={{
                padding: "1rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <h4 style={{ fontSize: "1.2rem", color: "var(--primary-color)", marginBottom: "0.5rem" }}>
                {project.name}
              </h4>
              <p style={{ fontSize: "1rem", color: "var(--text-color)", marginBottom: "1rem" }}>
                {project.description}
              </p>
              <span
                style={{
                  backgroundColor: getStatusColor(project.status),
                  color: "white",
                  padding: "0.3rem 0.8rem",
                  borderRadius: "15px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                {project.status}
              </span>
            </div>
          ))
        ) : (
          <p>No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectInfo;
