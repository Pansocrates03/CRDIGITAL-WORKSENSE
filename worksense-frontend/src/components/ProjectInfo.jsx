import React from "react";
import "../styles/global.css";

const ProjectInfo = ({ project }) => {
  // Función para convertir el porcentaje de texto a número
  const getCompletionPercentage = () => {
    if (!project.metrics?.completion) return 0;
    const percentage = parseInt(
      project.metrics.completion.replace("%", ""),
      10
    );
    return isNaN(percentage) ? 0 : percentage;
  };

  // Función para determinar el color según el porcentaje
  const getProgressColor = (percentage) => {
    if (percentage < 30) return "#e74c3c"; // Rojo
    if (percentage < 70) return "#f39c12"; // Naranja
    return "#2ecc71"; // Verde
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
          Información del Proyecto
        </span>
      </h3>
      <div className="project-card">
        <h4
          style={{
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
            color: "var(--primary-color)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {project.name}
          {project.status && (
            <span
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
                padding: "0.2rem 0.8rem",
                borderRadius: "15px",
                fontSize: "0.8rem",
                fontWeight: "normal",
                marginLeft: "auto",
              }}
            >
              {project.status}
            </span>
          )}
        </h4>

        {project.description && (
          <p
            style={{
              fontSize: "1.1rem",
              marginBottom: "1.5rem",
              color: "var(--text-color)",
            }}
          >
            {project.description}
          </p>
        )}

        {project.startDate && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
              color: "var(--secondary-color)",
            }}
          >
            <span style={{ marginRight: "0.5rem" }}>Inicio:</span>
            <span style={{ fontWeight: "bold" }}>{project.startDate}</span>
          </div>
        )}

        {project.metrics && (
          <div className="project-metrics">
            {project.metrics.completion && (
              <div className="metric-item" style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>
                    Progreso del proyecto
                  </span>
                  <span>{project.metrics.completion}</span>
                </div>
                <div
                  className="progress-bar-container"
                  style={{
                    height: "8px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="progress-bar"
                    style={{
                      height: "100%",
                      width: `${getCompletionPercentage()}%`,
                      backgroundColor: getProgressColor(
                        getCompletionPercentage()
                      ),
                      borderRadius: "4px",
                      transition: "width 1s ease-in-out",
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div
              className="metrics-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              {project.metrics.tasks && (
                <div
                  className="metric-card"
                  style={{
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--secondary-color)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Tareas
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {project.metrics.tasks}
                  </div>
                </div>
              )}

              {project.metrics.nextMilestone && (
                <div
                  className="metric-card"
                  style={{
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--secondary-color)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Próximo hito
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {project.metrics.nextMilestone}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectInfo;
