import React, { useState, useEffect } from "react";
import "./styles/global.css";
import UserInfo from "./components/UserInfo";
import AIMessage from "./components/AIMessage";
import ProjectInfo from "./components/ProjectInfo";
import EpicStories from "./components/SofttekAPITest"; 

const API_BASE_URL = "http://localhost:5050";

function App() {
  const [userData, setUserData] = useState({
    firstName: "Test User",
    lastName: "",
    email: "",
  });

  const [projectData, setProjectData] = useState({
    name: "Test Project",
  });

  const [aiMessage, setAiMessage] = useState("Loading AI message...");

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`);
      if (!response.ok) {
        throw new Error("Server response error");
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setUserData({
          firstName: data[0].firstName || "User",
          lastName: data[0].lastName || "",
          email: data[0].email || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData({
        firstName: "Error loading user",
        lastName: "",
        email: "",
      });
    }
  };

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sqltest`);
      if (!response.ok) {
        throw new Error("Server response error");
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setProjectData({
          name: data[0].text || "Project not found",
        });
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
      setProjectData({
        name: "Error loading project",
      });
    }
  };

  const fetchAIMessage = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini`);
      if (!response.ok) {
        throw new Error(
          `Server response error: ${response.status}`
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
        setAiMessage("Could not retrieve a clear AI response");
      }
    } catch (error) {
      console.error("Error fetching Gemini message:", error);
      setAiMessage("Error connecting to AI service: " + error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchProjectData();
    fetchAIMessage();
  }, []);

  return (
    <div className="App" style={{ backgroundColor: "var(--background-color)", minHeight: "100vh" }}>
      <UserInfo
        firstName={userData.firstName}
        lastName={userData.lastName}
        email={userData.email}
      />
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Left Side */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          <AIMessage message={aiMessage} />
          <ProjectInfo project={projectData} />
        </div>
        {/* Right Side */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: "30px" }}>
          <EpicStories />
        </div>
      </div>
    </div>
  );
}

export default App;