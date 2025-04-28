// useMembers.ts
import { useContext, useCallback } from "react";
import { ProjectsContext } from "@/contexts/UserProjectsContext";
import { projectService } from "@/services/projectService"; // Asumo que tienes un servicio similar para members

export function useUserProjects() {
  const [projectList, setProjectList] = useContext(ProjectsContext);

  const getUserProjects = useCallback(async () => {

    // Checamos que si exista la lista de miembros
    if (projectList && projectList.length > 0) {
      console.log("Returning cached member data");
      return projectList;
    }

    // Si no existe, obtén los datos de la API
    console.log("Fetching projects from API");
    const data = await projectService.fetchUserProjects();

    // Actualiza la lista de miembros agregando el nuevo
    setProjectList(data);

    return data;
  }, [projectList, setProjectList]);

  return { getUserProjects };
}
