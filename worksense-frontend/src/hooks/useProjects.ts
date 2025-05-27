import { endpoints } from "@/lib/constants/endpoints"
import { useQuery } from "@tanstack/react-query"
import ProjectDetails from "@/types/ProjectType"

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