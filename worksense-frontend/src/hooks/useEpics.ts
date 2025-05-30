import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { endpoints } from "@/lib/constants/endpoints";
import { Epic } from "@/types/EpicType";
import apiClient from "@/api/apiClient";

// Define types for mutations if not already part of EpicType.ts
type CreateEpicPayload = Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateEpicPayload = Partial<Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>>; // Usually don't update id/timestamps directly

type UseEpicsReturn = UseQueryResult<Epic[], Error> & {
    addEpic: (epicData: CreateEpicPayload) => Promise<Epic>;
    updateEpic: (epicId: string, epicData: UpdateEpicPayload) => Promise<Epic>;
    deleteEpic: (epicId: string) => Promise<void>;
};

export const useEpics = (projectId: string): UseEpicsReturn => {
    const queryClient = useQueryClient();
    const epicsQueryKey: ["epics", string] = ["epics", projectId];

    const query = useQuery<Epic[], Error, Epic[], ["epics", string]>({
        queryKey: epicsQueryKey,
        queryFn: async () => {
            if (!projectId) return [];
            // 2. Use apiClient for GET
            const response = await apiClient.get<Epic[]>(endpoints.getEpics(projectId));
            return response.data; // Axios parses JSON
        },
        enabled: !!projectId,
    });

    const addEpic = async (epicData: CreateEpicPayload): Promise<Epic> => {
        try {
            // 3. Use apiClient for POST
            const response = await apiClient.post<Epic>(endpoints.createEpic(projectId), epicData);
            queryClient.invalidateQueries({ queryKey: epicsQueryKey });
            return response.data;
        } catch (error) {
            console.error("Failed to create epic:", error);
            throw error;
        }
    };

    const updateEpic = async (epicId: string, epicData: UpdateEpicPayload): Promise<Epic> => {
        try {
            // 4. Use apiClient for PUT
            const response = await apiClient.put<Epic>(endpoints.updateEpic(projectId, epicId), epicData);
            queryClient.invalidateQueries({ queryKey: epicsQueryKey });
            return response.data;
        } catch (error) {
            console.error("Failed to update epic:", error);
            throw error;
        }
    };

    const deleteEpic = async (epicId: string): Promise<void> => {
        try {
            // 5. Use apiClient for DELETE
            await apiClient.delete(endpoints.deleteEpic(projectId, epicId));
            queryClient.invalidateQueries({ queryKey: epicsQueryKey });
            // Invalidate stories if epics are linked and deleting an epic affects stories
            queryClient.invalidateQueries({ queryKey: ["stories", projectId] }); // Assuming stories are also scoped by projectId
            queryClient.invalidateQueries({ queryKey: ["stories"] }); // If there's a global stories list
        } catch (error) {
            console.error("Failed to delete epic:", error);
            throw error;
        }
    };

    return {
        ...query,
        addEpic,
        updateEpic,
        deleteEpic
    };
};