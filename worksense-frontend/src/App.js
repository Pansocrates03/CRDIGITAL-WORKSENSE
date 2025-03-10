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
    firstName: "Usuario de Prueba",
    lastName: "",
    email: "",
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
      // La respuesta es un array de usuarios, tomamos el primero
      if (data && data.length > 0) {
        setUserData({
          firstName: data[0].firstName || "Usuario",
          lastName: data[0].lastName || "",
          email: data[0].email || "",
        });
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      setUserData({
        firstName: "Error al cargar usuario",
        lastName: "",
        email: "",
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
      // La respuesta es un array con un objeto que tiene la propiedad text
      if (data && data.length > 0) {
        setProjectData({
          name: data[0].text || "Proyecto no encontrado",
        });
      }
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
      <UserInfo
        firstName={userData.firstName}
        lastName={userData.lastName}
        email={userData.email}
      />
      <div style={{ padding: "20px" }}>
        <AIMessage message={aiMessage} />
        <ProjectInfo project={projectData} />
      </div>
    </div>
  );
}

export default App;
