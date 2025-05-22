import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {projectService} from "@/services/projectService";
import MemberDetailed from "@/types/MemberDetailedType";

export function useMembers(projectId: string) {
    return useQuery<MemberDetailed[], Error>({
        queryKey: ["members", projectId],
        queryFn: () => projectService.fetchProjectMembersDetailed(projectId),
        enabled: !!projectId, // Only fetch if projectId exists
    });
}

export function useUser(userId: number | undefined) {
    return useQuery<MemberDetailed, Error>({
        queryKey: ["user", userId], // Key is now just based on the userId
        queryFn: () => projectService.fetchUserById(userId!), // Call the new service method
        enabled: !!userId, // Only enable the query if userId exists
        // Optional: Add staleTime and cacheTime for optimal caching
        staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
        cacheTime: 1000 * 60 * 60, // Keep data in cache for 1 hour even if inactive
    });
}

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
