import {
    useQuery, useMutation, useQueryClient, UseMutationOptions, UseQueryResult, UseMutateFunction
} from "@tanstack/react-query";
import { endpoints } from "@/lib/constants/endpoints";
// Adjust import based on how ProjectDetails is exported:
// Assuming ProjectSummary is also in ProjectType.ts or similar
import apiClient from "@/api/apiClient";
import ProjectDetails from "@/types/ProjectSummary.ts";
import ProjectSummary from "@/types/ProjectSummary.ts";

type UseProjectsResult = UseQueryResult<ProjectSummary[], Error> & {
    createProject: UseMutateFunction<ProjectDetails, Error, Omit<ProjectDetails, "id">, unknown>;
};

// Hook to fetch all projects (summary view)
export const useProjects = (): UseProjectsResult => {
    const queryClient = useQueryClient();

    const query = useQuery<ProjectSummary[], Error, ProjectSummary[], ["projects"]>({
        queryKey: ["projects"],
        queryFn: async () => {
            const response = await apiClient.get<ProjectSummary[]>(endpoints.getProjects());
            return response.data;
        },
    });
    
    const createProject = async (projectData: Omit<ProjectDetails, "id">): Promise<ProjectDetails> => {
        const response = await apiClient.post<ProjectDetails>(endpoints.createProject(), projectData);
        return response.data;
    }

    const mutation = useMutation<ProjectDetails, Error, Omit<ProjectDetails, "id">>({
        mutationFn: createProject,
        onSuccess: (newProject) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.setQueryData<ProjectDetails[]>(['projects'], (oldProjects) => {
                if (!oldProjects) return [];
                return [...oldProjects, newProject as ProjectDetails];
            });
        },
    });

    return {
        ...query,
        createProject: mutation.mutateAsync
    };
};

// Hook to fetch a single project's details
export const useProject = (projectId: string): UseQueryResult<ProjectDetails, Error> => {
    // Consistent query key for a single project
    const projectQueryKey: ["project", string] = ["project", projectId];

    return useQuery<ProjectDetails, Error, ProjectDetails, ["project", string]>({
        queryKey: projectQueryKey,
        queryFn: async () => {
            if (!projectId) {
                // Or throw, or handle as per your app's logic
                throw new Error("Project ID is required to fetch project details.");
            }
            const response = await apiClient.get<ProjectDetails>(endpoints.getProject(projectId));
            return response.data;
        },
        enabled: !!projectId, // Only run if projectId is truthy
    });
};

// Define types for the update mutation
type UpdateProjectVariables = { id: string; data: Partial<ProjectDetails> }; // Use Partial for updates
type UpdateProjectData = ProjectDetails; // Assuming API returns the full updated project
type UpdateProjectError = Error; // Or a more specific error type

export const useUpdateProject = (
    options?: UseMutationOptions<UpdateProjectData, UpdateProjectError, UpdateProjectVariables>
) => {
    const queryClient = useQueryClient();
    return useMutation<UpdateProjectData, UpdateProjectError, UpdateProjectVariables>({
        mutationFn: async ({ id, data }) => {
            // apiClient.put handles JSON.stringify and Content-Type
            const response = await apiClient.put<ProjectDetails>(endpoints.updateProject(id), data);
            return response.data; // Axios handles JSON parsing and throws on non-2xx
        },
        onSuccess: (updatedProjectData, variables, context) => {
            // Invalidate the specific project query
            queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
            // Invalidate the list of all projects
            queryClient.invalidateQueries({ queryKey: ["projects"] });

            // Optimistically update the specific project cache
            queryClient.setQueryData(["project", variables.id], updatedProjectData);

            // Optionally, optimistically update the projects list if applicable
            queryClient.setQueryData(['projects'], (oldProjects?: ProjectSummary[]) =>
                oldProjects?.map(p =>
                    p.id === variables.id ? { ...p, ...variables.data } : p // Update with new data
                ) ?? []
            );

            if (options?.onSuccess) {
                options.onSuccess(updatedProjectData, variables, context);
            }
        },
        // onError, onSettled can be handled similarly if needed from options
        ...options, // Spread other options like onError, onSettled
    });
};


// Define types for the delete mutation
type DeleteProjectVariables = string; // projectId
type DeleteProjectData = void; // Or { message: string } if API returns something
type DeleteProjectError = Error;

export const useDeleteProject = (
    options?: UseMutationOptions<DeleteProjectData, DeleteProjectError, DeleteProjectVariables>
) => {
    const queryClient = useQueryClient();
    return useMutation<DeleteProjectData, DeleteProjectError, DeleteProjectVariables>({
        mutationFn: async (id: string) => {
            // apiClient.delete returns a promise, often with no significant response body for DELETE
            // If your API returns data, you can type it: await apiClient.delete<{ message: string }>(...)
            await apiClient.delete(endpoints.deleteProject(id));
            // Axios throws on non-2xx, so no explicit 'ok' check needed here
            // If you need to return something specific (e.g. from a 204 No Content response)
            // you might return a static value or handle it based on the response.
            // For a 204, response.data will often be undefined or an empty string.
        },
        onSuccess: (data, projectId, context) => { // 'variables' here is the projectId
            // Invalidate the list of all projects
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            // Remove the specific project from cache if it exists
            queryClient.removeQueries({ queryKey: ["project", projectId] });

            // Optimistically update the projects list
            queryClient.setQueryData(['projects'], (oldProjects?: ProjectSummary[]) =>
                oldProjects?.filter(p => p.id !== projectId) ?? []
            );


            if (options?.onSuccess) {
                options.onSuccess(data, projectId, context);
            }
        },
        ...options,
    });
};