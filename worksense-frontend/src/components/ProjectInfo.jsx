import React from "react";
import "../styles/global.css";

const ProjectInfo = ({ project }) => {
  return (
    <div className="container">
      <h3 className="section-title">Información del Proyecto</h3>
      <div className="project-card">
        <h4
          style={{
            fontSize: "1.5rem",
            marginBottom: "1rem",
            color: "var(--primary-color)",
          }}
        >
          {project.name}
        </h4>
        <p
          style={{
            fontSize: "1.1rem",
            marginBottom: "1.5rem",
            color: "var(--text-color)",
          }}
        >
          {project.description}
        </p>
        <div className="flex-column" style={{ gap: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: "bold" }}>Estado:</span>
            <span
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
                padding: "0.3rem 1rem",
                borderRadius: "15px",
              }}
            >
              {project.status}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: "bold" }}>Fecha de inicio:</span>
            <span>{project.startDate}</span>
          </div>
          {project.metrics && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Progreso:</span>
                <span>{project.metrics.completion}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Tareas:</span>
                <span>{project.metrics.tasks}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Próximo hito:</span>
                <span>{project.metrics.nextMilestone}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
