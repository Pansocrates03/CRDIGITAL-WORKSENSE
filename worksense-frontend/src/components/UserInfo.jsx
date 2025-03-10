import React, { useState, useEffect } from "react";
import "../styles/global.css";

const UserInfo = ({ firstName, lastName, email }) => {
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar el saludo según la hora del día
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting("¡Buenos días");
      } else if (hour >= 12 && hour < 18) {
        setGreeting("¡Buenas tardes");
      } else {
        setGreeting("¡Buenas noches");
      }
    };
    updateGreeting();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      updateGreeting();
    }, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  // Generar iniciales para el avatar
  const getInitials = () => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  // Generar un color basado en el nombre
  const getAvatarColor = () => {
    const name = firstName + lastName;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 40%)`;
  };

  return (
    <div className="header">
      <div className="container">
        <div className="user-info">
          <div
            className="avatar"
            style={{
              backgroundColor: getAvatarColor(),
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "1.2rem",
              marginRight: "15px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            {getInitials()}
          </div>
          <div className="user-details">
            <div className="greeting-container">
              <h2 className="greeting">
                {greeting}, {firstName}!
              </h2>
              <span className="time">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="email">{email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;