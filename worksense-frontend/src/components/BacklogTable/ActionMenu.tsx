// src/components/BacklogTable/ActionMenu.tsx
import React, { useState, useRef, useEffect, FC } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import styles from "./ActionMenu.module.css";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenu: FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Toggle menu
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Handle edit action
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onEdit();
  };

  // Handle delete action
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onDelete();
  };

  return (
    <div className={styles.actionMenuContainer} ref={menuRef}>
      <button
        onClick={toggleMenu}
        className={styles.menuButton}
        title="Actions"
        aria-label="Actions"
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div className={styles.menuDropdown}>
          <button onClick={handleEdit} className={styles.menuItem}>
            <Pencil size={16} className={styles.menuIcon} />
            <span>Edit</span>
          </button>
          <button onClick={handleDelete} className={`${styles.menuItem} ${styles.deleteItem}`}>
            <Trash2 size={16} className={styles.menuIcon} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;