import React, { useState, useEffect } from "react";
import "./styles/global.css";
import UserInfo from "./components/UserInfo";
import AIMessage from "./components/AIMessage";
import ProjectInfo from "./components/ProjectInfo";

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

  // Funciones para obtener datos de los endpoints (a implementar)
  const fetchUserData = async () => {
    try {
      // TODO: Implementar llamada al endpoint de usuario
      // const response = await fetch('API_URL/user');
      // const data = await response.json();
      // setUserData(data);
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
    }
  };

  const fetchProjectData = async () => {
    try {
      // TODO: Implementar llamada al endpoint del proyecto
      // const response = await fetch('API_URL/project');
      // const data = await response.json();
      // setProjectData(data);
    } catch (error) {
      console.error("Error al obtener datos del proyecto:", error);
    }
  };

  const fetchAIMessage = async () => {
    try {
      // TODO: Implementar llamada al endpoint de IA
      // const response = await fetch('API_URL/ai-message');
      // const data = await response.json();
      // setAiMessage(data.message);
    } catch (error) {
      console.error("Error al obtener mensaje de IA:", error);
    }
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
