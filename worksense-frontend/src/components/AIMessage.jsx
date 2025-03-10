import React from "react";
import "../styles/global.css";

const AIMessage = ({ message }) => {
  return (
    <div className="container">
      <h3 className="section-title">
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span role="img" aria-label="AI"></span>
          Mensaje IA
        </span>
      </h3>
      <div
        className="ai-message"
        style={{
          fontSize: "1.1rem",
          lineHeight: "1.6",
          borderLeft: "4px solid var(--primary-color)",
        }}
      >
        <p style={{ margin: 0 }}>{message}</p>
      </div>
    </div>
  );
};

export default AIMessage;
