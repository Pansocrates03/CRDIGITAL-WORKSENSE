// src/components/BacklogTable/StatusBadge.tsx
import React, { FC } from "react";
import styles from "./SelectField.module.css"; // Reutilizamos los estilos de colores de SelectField

interface StatusBadgeProps {
  type: string;
  value: string;
  size?: "small" | "medium" | "large";
}

const StatusBadge: FC<StatusBadgeProps> = ({ type, value, size = "medium" }) => {
  // Obtiene la clase basada en el tipo y valor
  const getBadgeClass = () => {
    if (type === "type" && value) {
      return styles[`type${value.charAt(0).toUpperCase() + value.slice(1)}`];
    } else if (type === "status" && value) {
      // Convertir valores como 'in-progress' a 'inProgress' para el classname
      const formattedValue = value.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      return styles[`status${formattedValue.charAt(0).toUpperCase() + formattedValue.slice(1)}`];
    } else if (type === "priority" && value) {
      return styles[`priority${value.charAt(0).toUpperCase() + value.slice(1)}`];
    } else if (type === "severity" && value) {
      return styles[`severity${value.charAt(0).toUpperCase() + value.slice(1)}`];
    }
    return "";
  };

  const badgeClass = getBadgeClass();
  
  // Para valores vacíos o desconocidos
  if (!value || value === "-") {
    return <span className={styles.option}>-</span>;
  }

  // Formatea el texto para mostrarlo más amigable
  const formatLabel = (value: string) => {
    if (type === "status" && value === "in-progress") return "In Progress";
    if (type === "type" && value === "techTask") return "Tech Task";
    
    // Capitaliza la primera letra
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <span className={`${styles.option} ${badgeClass}`}>
      {formatLabel(value)}
    </span>
  );
};

export default StatusBadge;