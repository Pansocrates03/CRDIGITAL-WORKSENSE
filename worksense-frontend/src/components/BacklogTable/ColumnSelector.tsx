// src/components/BacklogTable/ColumnSelector.tsx
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { ColumnDefinition } from "./types";
import styles from "./ColumnSelector.module.css";

interface ColumnSelectorProps {
  columns: ColumnDefinition[];
  activeColumns: string[];
  onToggleColumn: (columnId: string) => void;
}

export const ColumnSelector: FC<ColumnSelectorProps> = ({
  columns,
  activeColumns,
  onToggleColumn,
}) => {
  return (
    <div className={styles.columnSelectorContainer}>
      <h3 className={styles.columnSelectorTitle}>Visible Columns</h3>
      <div className={styles.columnSelectorButtons}>
        {columns.map((column) => (
          <Button
            key={column.id}
            variant={activeColumns.includes(column.id) ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleColumn(column.id)}
            disabled={column.id === "title"} // No se puede desactivar la columna de título
          >
            {column.label}
          </Button>
        ))}
      </div>
    </div>
  );
};