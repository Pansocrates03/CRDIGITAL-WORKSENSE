import * as React from "react";
import styles from "./TextInput.module.css";

interface TextInputProps {
  inputType?: "text" | "email" | "password";
  inputName: string;
  inputValue: string;
  isRequired: boolean;
  labelText?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Usando la sintaxis de función más simple
export const TextInput: React.FC<TextInputProps> = ({ inputName, inputType, inputValue, isRequired, labelText, onChange }) => {

    // Usar el valor de inputName como predeterminado si labelText no está definido
    const displayLabel = labelText || inputName;
    const _inputType = inputType || "text"
  
    return (
      <div className={styles.formGroup}>
        <label htmlFor={inputName}>{displayLabel}</label>
        <input
          type={_inputType}
          id={inputName}
          name={inputName}
          value={inputValue}
          onChange={onChange}
          className={styles.input}
          required={isRequired}
        />
      </div>
    );

}