import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/constants/endpoints";
import { Epic } from "@/types/EpicType";

export const useEpics = (projectId: string) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["epics", projectId],
        queryFn: async () => {
            const response = await fetch(endpoints.getEpics(projectId));
            if (!response.ok) {
                throw new Error("Failed to fetch epics");
            }
            return response.json() as Promise<Epic[]>;
        },
    });

    const addEpic = async (epic: { name: string }) => {};

    const deleteEpic = async (epicId: string) => {
        const response = await fetch(endpoints.deleteEpic(projectId, epicId), {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error("Failed to delete epic");
        }
        queryClient.invalidateQueries({ queryKey: ["epics"] });
        queryClient.invalidateQueries({ queryKey: ["stories"] });
    };

    return {
        ...query, 
        addEpic,
        deleteEpic
    }
};