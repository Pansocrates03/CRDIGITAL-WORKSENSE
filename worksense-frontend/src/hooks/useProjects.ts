import { endpoints } from "@/lib/constants/endpoints"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import ProjectDetails from "@/types/ProjectType"
import { UseMutationOptions } from "@tanstack/react-query"

export const useProjects = () => {
    return useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const response = await fetch(endpoints.getProjects());
            return response.json();
        }
    })
}

export const useProject = (projectId:string) => {
    return useQuery({
        queryKey: ["project"],
        queryFn: async () => {
            const response = await fetch(endpoints.getProject(projectId));
            return response.json() as Promise<ProjectDetails>;
        }
    })
}

export const useUpdateProject = (
    options: UseMutationOptions<any, any, { id: string; data: any }> = {}
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const response = await fetch(endpoints.updateProject(id), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error("Failed to update project");
            }
            return response.json();
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            if (options.onSuccess) {
                options.onSuccess(data, variables, context);
            }
        },
        ...options,
    });
};