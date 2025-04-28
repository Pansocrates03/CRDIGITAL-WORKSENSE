import React, { createContext, useState, useContext } from "react";
import type ProjectDetails from "@/types/ProjectType";

// Tipo para la lista de miembros
type ProjectsList = ProjectDetails[];

// Definición del tipo del contexto
type ProjectsContextType = [
  ProjectsList,
  React.Dispatch<React.SetStateAction<ProjectsList>>
];

// Valor inicial del contexto
const initialContext: ProjectsContextType = [[], () => {}];

// Creación del contexto
export const ProjectsContext = createContext<ProjectsContextType>(initialContext);

// Provider component
export const MembersProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const projectsState = useState<ProjectsList>([]);

  return (
    <ProjectsContext.Provider value={projectsState}>
      {children}
    </ProjectsContext.Provider>
  );
};

// Custom hook para usar el contexto
export const useProjectsContext = () => {
  const context = useContext(ProjectsContext);

  if (!context) {
    throw new Error("useProjectsContext debe usarse dentro de un ProjectsProvider");
  }

  return context;
};
