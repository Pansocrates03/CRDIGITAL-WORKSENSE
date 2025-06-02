// src/components/BacklogTable/ActionMenu.tsx
import React, { useState, useRef, useEffect, FC } from "react";
import { MoreHorizontal, Pencil, Trash2, Sparkles, Eye } from "lucide-react";
import styles from "./ActionMenu.module.css";
import { toast } from "sonner";

interface ActionMenuProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onViewDetails?: () => void; // Nueva función para ver detalles
  onGenerateStories?: () => void;
  isEpic?: boolean;
  itemType?: string;
  enableAiSuggestions?: boolean;
  hasPermissions?: boolean;
}

const ActionMenu: FC<ActionMenuProps> = ({ 
  onEdit, 
  onDelete, 
  onViewDetails,
  onGenerateStories, 
  isEpic = false,
  itemType,
  enableAiSuggestions = true,
    hasPermissions
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Determinamos si debemos mostrar la opción de IA según el tipo de ítem
  const canGenerateStories = isEpic || itemType === "epic";

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
    onEdit(e);
  };

  // Handle delete action
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onDelete(e);
  };

  // Handle view details action
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onViewDetails?.();
  };

  // Handle generate stories action
  const handleGenerateStories = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (!enableAiSuggestions) {
      toast.warning("AI Suggestions are currently disabled for this project.");
      return;
    }
    onGenerateStories?.();
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
          {onViewDetails && (
            <button onClick={handleViewDetails} className={styles.menuItem}>
              <Eye size={16} className={styles.menuIcon} />
              <span>View Details</span>
            </button>
          )}
          {canGenerateStories && onGenerateStories && hasPermissions && (
            <button
              onClick={handleGenerateStories}
              className={`${styles.menuItem} ${styles.aiItem}`}
              disabled={!enableAiSuggestions}
              style={!enableAiSuggestions ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              <Sparkles size={16} className={styles.menuIcon} style={{color: "#ac1754"}} />
              <span>Generate Stories</span>
            </button>
          )}
          <button onClick={handleEdit} className={styles.menuItem}>
            <Pencil size={16} className={styles.menuIcon} />
            <span>Edit</span>
            <>{console.log("action menu has permissions ",hasPermissions)}</>

          </button>

          {hasPermissions && <button onClick={handleDelete} className={`${styles.menuItem} ${styles.deleteItem}`}>
            <Trash2 size={16} className={styles.menuIcon} />
            <span>Delete</span>
            <>{console.log(hasPermissions)}</>
          </button>}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
