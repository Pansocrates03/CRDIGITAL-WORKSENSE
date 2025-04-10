import React from "react";
import styles from "./NewProjectModal.module.css";

// Input field with clear button
const InputWithClear: React.FC<{
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder: string;
  label: string;
  error?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  required?: boolean;
}> = ({
  id,
  value,
  onChange,
  onClear,
  placeholder,
  label,
  error,
  inputRef,
  required = false,
}) => (
  <div className={styles.formGroup}>
    <label htmlFor={id}>{label}</label>
    <div className={styles.inputWrapper}>
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-required={required ? "true" : "false"}
        aria-invalid={!!error}
      />
      {value && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={onClear}
          aria-label={`Clear ${label.toLowerCase()}`}
        >
          <span aria-hidden="true">✕</span>
        </button>
      )}
    </div>
    {error && (
      <p className={styles.errorMessage} role="alert">
        {error}
      </p>
    )}
  </div>
);

export default InputWithClear;
