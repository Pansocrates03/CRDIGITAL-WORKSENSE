import React, { useState, useEffect } from "react";
import "./styles/global.css";
import UserInfo from "./components/UserInfo";
import AIMessage from "./components/AIMessage";
import ProjectInfo from "./components/ProjectInfo";
import EpicStories from "./components/SofttekAPITest"; 

const API_BASE_URL = "http://localhost:5050";

function App() {
  const [userData, setUserData] = useState({
    firstName: "Usuario de Prueba",
    lastName: "",
    email: "",
  });

  const [projectData, setProjectData] = useState({
    name: "Proyecto de Prueba",
  });

  const [aiMessage, setAiMessage] = useState("Cargando mensaje de IA...");

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`);
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      const data = await response.json();
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

  const fetchAIMessage = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini`);
      if (!response.ok) {
        throw new Error(
          `Error en la respuesta del servidor: ${response.status}`
        );
      }
      const data = await response.json();
      if (
        data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text
      ) {
        setAiMessage(data.candidates[0].content.parts[0].text);
      } else {
        setAiMessage("No se pudo obtener una respuesta clara de la IA");
      }
    } catch (error) {
      console.error("Error al obtener mensaje de Gemini:", error);
      setAiMessage("Error al conectar con el servicio de IA: " + error.message);
    }
  };

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
        <EpicStories /> {/* Adding the EpicStories component */}
      </div>
    </div>
  );
}

export default App;
