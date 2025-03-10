import React, { useState, useEffect } from "react";
import "./styles/global.css";
import UserInfo from "./components/UserInfo";
import AIMessage from "./components/AIMessage";
import ProjectInfo from "./components/ProjectInfo";

// URL base del backend
const API_BASE_URL = "http://localhost:5000";

function App() {
  // Estados para manejar los datos que vendrán de los endpoints
  const [userData, setUserData] = useState({
    username: "Usuario de Prueba",
  });

  const [projectData, setProjectData] = useState({
    name: "Proyecto de Prueba",
  });

  const [aiMessage, setAiMessage] = useState(
    "¡Bienvenido al sistema! Los endpoints están en preparación."
  );

  // Funciones para obtener datos de los endpoints
  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`);
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      const data = await response.json();
      // Asumiendo que la respuesta tiene un formato específico
      setUserData({
        username: data[0]?.nombre || "Usuario no encontrado",
      });
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      setUserData({
        username: "Error al cargar usuario",
      });
    }
  };

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sqltest`);
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      const data = await response.json();
      setProjectData({
        name: data.text || "Proyecto no encontrado",
      });
    } catch (error) {
      console.error("Error al obtener datos del proyecto:", error);
      setProjectData({
        name: "Error al cargar proyecto",
      });
    }
  };

  // TODO: Implementar cuando el endpoint de IA esté disponible
  const fetchAIMessage = () => {
    setAiMessage("Endpoint de IA en desarrollo");
  };

  // useEffect para cargar datos cuando el componente se monte
  useEffect(() => {
    fetchUserData();
    fetchProjectData();
    fetchAIMessage();
  }, []);

  return (
    <div
      className="App"
      style={{ backgroundColor: "var(--background-color)", minHeight: "100vh" }}
    >
      <UserInfo username={userData.username} />
      <div style={{ padding: "20px" }}>
        <AIMessage message={aiMessage} />
        <ProjectInfo project={projectData} />
      </div>
    </div>
  );
}

export default App;
