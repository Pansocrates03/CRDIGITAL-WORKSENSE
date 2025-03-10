import React from "react";
import "./styles/global.css";
import UserInfo from "./components/UserInfo";
import AIMessage from "./components/AIMessage";
import ProjectInfo from "./components/ProjectInfo";

function App() {
  // Datos de ejemplo más detallados
  const mockData = {
    username: "Santiago Monroy",
    aiMessage:
      "¡Bienvenido al sistema! He analizado los datos de tu proyecto y todo parece estar progresando según lo planeado. Las métricas de rendimiento muestran una tendencia positiva.",
    project: {
      name: "WorkSense Dashboard",
      description:
        "Sistema de análisis y visualización de datos para mejorar la productividad y el bienestar en el entorno laboral.",
      status: "En Desarrollo",
      startDate: "2024-03-10",
      metrics: {
        completion: "65%",
        tasks: "12/20 completadas",
        nextMilestone: "Integración de IA",
      },
    },
  };

  return (
    <div
      className="App"
      style={{ backgroundColor: "var(--background-color)", minHeight: "100vh" }}
    >
      <UserInfo username={mockData.username} />
      <div style={{ padding: "20px" }}>
        <AIMessage message={mockData.aiMessage} />
        <ProjectInfo project={mockData.project} />
      </div>
    </div>
  );
}

export default App;
