import React, { useState } from "react";
import "../styles/EpicStories.css";

const EPIC_URL = "https://stk-formador-25.azurewebsites.net/epics/generate-user-stories-from-epic-name/";

function EpicStories() {
  const [epicData, setEpicData] = useState([]);
  const [inputData, setInputData] = useState({
    project_description: "",
    project_technical_stack: "",
    objective: "",
    language: "English",
  });
  const [expandedStory, setExpandedStory] = useState(null);

  const fetchEpicData = async () => {
    try {
      const response = await fetch(EPIC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();
      if (data.success) {
        setEpicData(data.data);
      } else {
        setEpicData([]);
      }
    } catch (error) {
      console.error("Error al obtener datos épicos:", error);
      setEpicData([]);
    }
  };

  const handleInputChange = (e) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const toggleStoryDetails = (index) => {
    setExpandedStory(expandedStory === index ? null : index);
  };

  return (
    <div className="epic-stories-wrapper">
      <h3 className="section-title">
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            className="epic-icon"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-color)",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            EP
          </span>
          Epic Story Generator
        </span>
      </h3>

      <div className="epic-stories-container">
        <h2>Generate User Stories</h2>
        <div className="form-group">
          <input
            type="text"
            name="project_description"
            placeholder="Project Description"
            value={inputData.project_description}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="project_technical_stack"
            placeholder="Technical Stack"
            value={inputData.project_technical_stack}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="objective"
            placeholder="Objective (Epic Name)"
            value={inputData.objective}
            onChange={handleInputChange}
          />
          <button onClick={fetchEpicData}>Generate</button>
        </div>
      </div>

      <div className="recent-generations">
        <h3>Recent Generations</h3>
        <div className="cards-container">
          {epicData.length > 0 ? (
            epicData.map((story, index) => (
              <div key={index} className="story-card">
                <h4>{story.user_story}</h4>
                <p>{story.description}</p>
                <button className="details-btn" onClick={() => toggleStoryDetails(index)}>→</button>
                {expandedStory === index && (
                  <div className="story-details">
                    <p><strong>Acceptance Criteria:</strong> {story.acceptance_criteria}</p>
                    <p><strong>Out of Scope:</strong> {story.out_of_scope}</p>
                    <p><strong>Test Cases:</strong> {story.test_cases}</p>
                    <p><strong>Gherkin:</strong> {story.gherkin}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No user stories generated yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EpicStories;