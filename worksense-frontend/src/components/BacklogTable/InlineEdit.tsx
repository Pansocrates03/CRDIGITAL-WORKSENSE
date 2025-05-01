// src/components/BacklogTable/InlineEdit.tsx
import React, { FC, useState } from 'react';
import StatusBadge from './StatusBadge';
import styles from './InlineEdit.module.css';

interface InlineEditProps {
  type: 'status' | 'priority' | 'severity';
  value: string;
  itemId: string;
  onUpdate: (itemId: string, value: string) => void;
  options: { value: string; label: string }[];
}

const InlineEdit: FC<InlineEditProps> = ({ 
  type, 
  value, 
  itemId, 
  onUpdate,
  options 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
  };

  const handleBlur = () => {
    if (currentValue !== value) {
      onUpdate(itemId, currentValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <select
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className={styles.selectField}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div 
      onClick={handleClick} 
      className={styles.editableField}
      title="Click to edit"
    >
      <StatusBadge type={type} value={value} />
    </div>
  );
};

export default InlineEdit;