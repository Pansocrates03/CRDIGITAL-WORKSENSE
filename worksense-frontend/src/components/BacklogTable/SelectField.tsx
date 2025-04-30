// src/components/BacklogTable/SelectField.tsx
import React, { FC } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./SelectField.module.css";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  label: string;
  required?: boolean;
  placeholder?: string;
  styleClass?: string;
}

export const SelectField: FC<SelectFieldProps> = ({
  id,
  name,
  value,
  onChange,
  options,
  label,
  required = false,
  placeholder,
  styleClass,
}) => {
  // Determina la clase de estilo basada en el tipo de campo y valor
  const getSelectClass = () => {
    if (styleClass) {
      if (name === "type" && value) {
        return styles[`type${value.charAt(0).toUpperCase() + value.slice(1)}`];
      } else if (name === "status" && value) {
        // Convertir valores como 'in-progress' a 'inProgress' para el classname
        const formattedValue = value.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        return styles[`status${formattedValue.charAt(0).toUpperCase() + formattedValue.slice(1)}`];
      } else if (name === "priority" && value) {
        return styles[`priority${value.charAt(0).toUpperCase() + value.slice(1)}`];
      } else if (name === "severity" && value) {
        return styles[`severity${value.charAt(0).toUpperCase() + value.slice(1)}`];
      }
    }
    return "";
  };

  const selectClass = getSelectClass();

  return (
    <div className={styles.formGroup}>
      <label htmlFor={id}>{label}{required && "*"}</label>
      <div className={styles.selectContainer}>
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`${styles.select} ${selectClass}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className={styles.iconContainer}>
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
};

export default SelectField;