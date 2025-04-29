// src/pages/BacklogTable/BacklogTablePage.tsx
import { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { BacklogHeader } from "../../components/BacklogTable/BacklogHeader";
import { BacklogTable } from "../../components/BacklogTable/BacklogTable";
import { ColumnSelector } from "../../components/BacklogTable/ColumnSelector";
import { ColumnDefinition } from "../../components/BacklogTable/types";
import styles from "./BacklogTablePage.module.css";

// Datos temporales - Idealmente se moverían a un servicio o contexto
import { backlogData } from "../../components/BacklogTable/data";

const BacklogTablePage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [expandedEpics, setExpandedEpics] = useState<string[]>([]);
  
  // Estado para las columnas visibles
  const [activeColumns, setActiveColumns] = useState<string[]>([
    "title",
    "status",
    "assignee",
    "size",
  ]);

  // Función para activar/desactivar columnas
  const toggleColumn = (columnId: string) => {
    if (activeColumns.includes(columnId)) {
      // No permitir remover la columna de título
      if (columnId === "title") return;

      setActiveColumns(activeColumns.filter((id) => id !== columnId));
    } else {
      setActiveColumns([...activeColumns, columnId]);
    }
  };

  // Función para controlar la expansión de épicas
  const toggleEpic = (epicId: string) => {
    setExpandedEpics((prev) =>
      prev.includes(epicId)
        ? prev.filter((id) => id !== epicId)
        : [...prev, epicId]
    );
  };

  // Función para manejar la adición de un nuevo item
  const handleAddItem = () => {
    alert(`Adding item to project: ${projectId}`);
  };

  return (
    <div className={styles.backlogPageContainer}>
      <div className={styles.contentWrapper}>
        <BacklogHeader 
          projectId={projectId} 
          onAddItem={handleAddItem} 
        />
        
        {/* Aquí podríamos agregar el selector de columnas */}
        {/* <ColumnSelector 
          activeColumns={activeColumns}
          onToggleColumn={toggleColumn}
        /> */}
        
        <BacklogTable 
          data={backlogData}
          activeColumns={activeColumns}
          expandedEpics={expandedEpics}
          onToggleEpic={toggleEpic}
        />
      </div>
    </div>
  );
};

export default BacklogTablePage;