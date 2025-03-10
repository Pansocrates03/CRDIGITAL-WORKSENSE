import React, { useState, useEffect } from "react";
import "../styles/global.css";

const AIMessage = ({ message }) => {
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [typingSpeed] = useState(30); // milisegundos por caracter

  // Efecto de escritura de texto
  useEffect(() => {
    if (!message) {
      setDisplayedMessage("");
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayedMessage("");

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= message.length) {
        setDisplayedMessage(message.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [message, typingSpeed]);

  return (
    <div className="container">
      <h3 className="section-title">
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            className="ai-icon"
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
            IA
          </span>
          Asistente Digital
        </span>
      </h3>
      <div
        className="ai-message"
        style={{
          fontSize: "1.1rem",
          lineHeight: "1.6",
          borderLeft: "4px solid var(--primary-color)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <p style={{ margin: 0 }}>{displayedMessage}</p>
        {isTyping && (
          <span
            className="typing-cursor"
            style={{
              display: "inline-block",
              width: "2px",
              height: "1.2em",
              backgroundColor: "var(--primary-color)",
              marginLeft: "2px",
              verticalAlign: "middle",
              animation: "blink 1s step-end infinite",
            }}
          ></span>
        )}
      </div>
    </div>
  );
};

export default AIMessage;
