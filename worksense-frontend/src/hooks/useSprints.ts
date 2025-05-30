import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { endpoints } from "@/lib/constants/endpoints"; // Ensure path is correct
import { Sprint } from "@/types/SprintType";           // Ensure path is correct
import apiClient from "@/api/apiClient";               // Import your apiClient

// Define the shape of the data passed to create a sprint
// Assumes 'id' is server-generated.
// If 'projectId' is part of your Sprint type but not needed in the POST payload,
// you might also Omit it here: Omit<Sprint, "id" | "projectId">
type CreateSprintPayload = Omit<Sprint, "id">;

// Define the return type for the hook
type UseSprintsReturn = UseQueryResult<Sprint[], Error> & {
    createSprint: (sprintData: CreateSprintPayload) => Promise<Sprint>; // Assuming API returns created sprint
    updateSprint: (sprintData: Sprint) => Promise<Sprint>;         // Assuming API returns updated sprint
    deleteSprint: (sprintId: string) => Promise<void>;
};

export const useSprints = (projectId: string): UseSprintsReturn => {
    const queryClient = useQueryClient();

    // Consistent query key for this project's sprints
    const sprintsQueryKey: ["sprints", string] = ["sprints", projectId];

    const query = useQuery<Sprint[], Error, Sprint[], ["sprints", string]>({
        queryKey: sprintsQueryKey,
        queryFn: async () => {
            if (!projectId) {
                return []; // Or handle as appropriate for your application
            }
            // apiClient.get will throw for non-2xx responses
            const response = await apiClient.get<Sprint[]>(endpoints.getSprints(projectId));
            return response.data; // Axios response.data is already parsed JSON
        },
        enabled: !!projectId, // Only run the query if projectId is truthy
    });

    const createSprint = async (sprintData: CreateSprintPayload): Promise<Sprint> => {
        try {
            // apiClient.post handles JSON.stringify and Content-Type
            const response = await apiClient.post<Sprint>(
                endpoints.createSprint(projectId),
                sprintData // Pass the sprint data (without id)
            );

            // Invalidate the query for this project's sprints to refetch
            queryClient.invalidateQueries({ queryKey: sprintsQueryKey });
            // Optimistic update example:
            // queryClient.setQueryData(sprintsQueryKey, (oldData?: Sprint[]) => [...(oldData ?? []), response.data]);

            return response.data; // Assuming API returns the created sprint
        } catch (error) {
            console.error("Failed to create sprint:", error);
            throw error; // Re-throw to be handled by the caller or React Query
        }
    };

    const updateSprint = async (sprintData: Sprint): Promise<Sprint> => {
        try {
            // apiClient.put handles JSON.stringify and Content-Type
            const response = await apiClient.put<Sprint>(
                endpoints.updateSprint(projectId, sprintData.id),
                sprintData // Pass the full sprint data for update
            );

            // Invalidate the query.
            // Optimistic update example:
            // queryClient.setQueryData(sprintsQueryKey, (oldData?: Sprint[]) =>
            //   oldData?.map(s => s.id === sprintData.id ? response.data : s) ?? []
            // );
            queryClient.invalidateQueries({ queryKey: sprintsQueryKey });

            return response.data; // Assuming API returns the updated sprint
        } catch (error) {
            console.error("Failed to update sprint:", error);
            throw error;
        }
    };

    const deleteSprint = async (sprintId: string): Promise<void> => {
        try {
            // Note: The original deleteSprint took projectId as an argument,
            // but it's already available in the hook's scope via the projectId parameter.
            // If endpoints.deleteSprint doesn't need projectId explicitly, you can remove it from its call.
            await apiClient.delete(endpoints.deleteSprint(projectId, sprintId));

            // Invalidate the query.
            // Optimistic update example:
            // queryClient.setQueryData(sprintsQueryKey, (oldData?: Sprint[]) =>
            //   oldData?.filter(s => s.id !== sprintId) ?? []
            // );
            queryClient.invalidateQueries({ queryKey: sprintsQueryKey });
        } catch (error) {
            console.error("Failed to delete sprint:", error);
            throw error;
        }
    };

    return {
        ...query,
        createSprint,
        updateSprint,
        deleteSprint,
    };
};