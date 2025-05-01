// src/components/BacklogTable/SelectField.tsx
import React, { FC } from "react";
import styles from "./CreateItemModal.module.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  label: string;
  required?: boolean;
  placeholder?: string;
  styleClass?: string;
  disabled?: boolean;
}

const SelectField: FC<SelectFieldProps> = ({
  id,
  name,
  value,
  onChange,
  options,
  label,
  required = false,
  placeholder,
  styleClass = "",
  disabled = false,
}) => {
  return (
    <div className={`${styles.formGroup} ${styles[styleClass] || ""}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={value ? "has-value" : ""}
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

export default SelectField;
