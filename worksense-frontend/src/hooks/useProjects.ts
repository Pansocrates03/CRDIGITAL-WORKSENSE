import { endpoints } from "@/lib/constants/endpoints"
import { useQuery } from "@tanstack/react-query"

export const useProjects = () => {
    return useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const response = await fetch(endpoints.getProjects());
            return response.json();
        }
    })
}