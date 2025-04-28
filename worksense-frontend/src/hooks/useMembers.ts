// useMembers.ts
import { useContext, useCallback } from "react";
import { MembersContext } from "@/contexts/MembersContext";
import { projectService } from "@/services/projectService"; // Asumo que tienes un servicio similar para members

export function useMembers() {
  const [membersList, setMembersList] = useContext(MembersContext);

  const getProjectMembers = useCallback(async (id: string) => {

    // Checamos que si exista la lista de miembros
    if (membersList) {
      console.log("Returning cached member data");
      return membersList;
    }

    // Si no existe, obtén los datos de la API
    console.log("Fetching member from API");
    const data = await projectService.fetchProjectMembers(id);

    // Actualiza la lista de miembros agregando el nuevo
    setMembersList(data);

    return data;
  }, [membersList, setMembersList]);

  return { getProjectMembers };
}
