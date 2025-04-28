import React, { createContext, useState, useContext } from "react";
import ProjectDetails from "@/types/ProjectType";

// Tipo para el caché de proyectos
type ProjectsCache = {
  [id: string]: ProjectDetails;
};

// Definición del tipo del contexto
type ProjectContextType = [
  ProjectsCache,
  React.Dispatch<React.SetStateAction<ProjectsCache>>
];

// Valor inicial del contexto
const initialContext: ProjectContextType = [{}, () => {}];

// Creación del contexto
export const ProjectContext = createContext<ProjectContextType>(initialContext);

// Provider component
export const ProjectProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const projectState = useState<ProjectsCache>({});
  
  return (
    <ProjectContext.Provider value={projectState}>
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook para usar el contexto
export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  
  if (!context) {
    throw new Error("useProjectContext debe usarse dentro de un ProjectProvider");
  }
  
  return context;
};