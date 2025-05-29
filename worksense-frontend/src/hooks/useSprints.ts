import { endpoints } from "@/lib/constants/endpoints"
import { Sprint } from "@/types/SprintType";
import { useQuery, useQueryClient } from "@tanstack/react-query"

export const useSprints = (projectId:string) => {
    const queryClient = useQueryClient();
    
    const query = useQuery({
        queryKey: ["sprints"],
        queryFn: async () => {
            const response = await fetch(endpoints.getSprints(projectId));
            const data = await response.json();
            return data as Sprint[];
        }
    })

    const createSprint = async (projectId:string, sprintData:Omit<Sprint,"id">) => {
        await fetch(endpoints.createSprint(projectId), {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sprintData)
        })

        queryClient.invalidateQueries({ queryKey: ["sprints"]})
    }

    const updateSprint = async (projectId:string, sprintData:Sprint) => {
        await fetch(endpoints.updateSprint(projectId, sprintData.id), {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sprintData)
        })
        queryClient.invalidateQueries({ queryKey: ["sprints"]})
    }

    const deleteSprint = async (projectId:string, sprintId:string) => {
        await fetch(endpoints.deleteSprint(projectId,sprintId))
        queryClient.invalidateQueries({ queryKey: ["sprints"]})
    }

    return {
        ...query,
        createSprint,
        updateSprint,
        deleteSprint
    }
} 