// useProject.ts
import { useContext, useCallback } from "react";
import { ProjectContext } from "@/contexts/ProjectContext";
import { projectService } from "./../services/projectService";

export function useProject() {
  const [projectsCache, setProjectsCache] = useContext(ProjectContext);
  
  const getProjectDetails = useCallback(async (id: string) => {
    // Si ya existe en el contexto, devuelve la versión en caché
    if (projectsCache && projectsCache[id]) {
      console.log("Returning cached project data");
      return projectsCache[id];
    }
    
    // Si no existe, haz la petición
    console.log("Fetching project from API");
    const data = await projectService.fetchProjectDetails(id);
    
    // Actualiza el caché con los nuevos datos
    setProjectsCache(prev => ({
      ...prev,
      [id]: data
    }));
    
    return data;
  }, [projectsCache, setProjectsCache]);
  
  return { getProjectDetails };
}