import * as React from "react";
import styles from "./SelectInput.module.css"; // Puedes reutilizar el mismo archivo CSS o crear uno nuevo

interface Option {
  value: string;
  label: string;
}

interface SelectInputProps {
  inputName: string;
  inputValue: string;
  options: Option[];
  isRequired: boolean;
  labelText?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({ 
  inputName, 
  inputValue, 
  options,
  isRequired, 
  labelText, 
  onChange,
  placeholder 
}) => {
  // Usar el valor de inputName como predeterminado si labelText no está definido
  const displayLabel = labelText || inputName;
  
  return (
    <div className={styles.formGroup}>
      <label htmlFor={inputName}>{displayLabel}</label>
      <select
        id={inputName}
        name={inputName}
        value={inputValue}
        onChange={onChange}
        className={styles.select}
        required={isRequired}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};