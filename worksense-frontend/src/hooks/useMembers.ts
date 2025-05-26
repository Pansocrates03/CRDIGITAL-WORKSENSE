import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {projectService} from "@/services/projectService";
import MemberDetailed from "@/types/MemberDetailedType";
import { endpoints } from "@/lib/constants/endpoints";

export const useMembers = (projectId: string) => {

    return useQuery<MemberDetailed[], Error>({
        queryKey: ["members", projectId],
        queryFn: async () => {
            const response = await fetch(endpoints.getMembers(projectId));
            return response.json();
        },
    });

};

export function useDeleteMember(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (memberId: number) =>
            projectService.removeMemberFromProject(projectId, memberId),
        onSuccess: () => {
            // Invalidate or update the cache after deletion
            queryClient.invalidateQueries({queryKey: ["members", projectId]});
        },
    });
}

export function useUpdateMemberRole(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({userId, role}: { userId: number; role: string }) =>
            projectService.updateMemberRole(projectId, userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["members", projectId]});
        },
    });
}
