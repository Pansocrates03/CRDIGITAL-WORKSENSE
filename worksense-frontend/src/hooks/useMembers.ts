import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {projectService} from "@/services/projectService";
import MemberDetailed from "@/types/MemberDetailedType";

export const useMembers = (projectId: string | undefined | null, options?: UseMembersOptions) => {
    const passedEnabledOption = options?.enabled;
    let queryShouldBeEnabled: boolean;

    if (passedEnabledOption === false) {
        // If 'enabled: false' is explicitly passed, the query is disabled.
        queryShouldBeEnabled = false;
    } else if (passedEnabledOption === true) {
        // If 'enabled: true' is explicitly passed, enable only if projectId is also present.
        queryShouldBeEnabled = !!projectId;
    } else {
        // If 'enabled' option is not passed (undefined), then enable based solely on projectId.
        queryShouldBeEnabled = !!projectId;
    }

    return useQuery<MemberDetailed[], Error>({
        queryKey: ["members", projectId],
        queryFn: () => {
            if (!projectId) {
                // Should not happen if queryShouldBeEnabled is false due to !projectId,
                // but good for type safety and preventing calls with undefined projectId.
                return Promise.reject(new Error("projectId is required to fetch members."));
            }
            return projectService.fetchProjectMembersDetailed(projectId);
        },
        enabled: queryShouldBeEnabled, // Use the calculated enabled status
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
};

export function useUser(userId: number | undefined) {
    return useQuery<MemberDetailed, Error>({
        queryKey: ["user", userId],
        queryFn: () => projectService.fetchUserById(userId!), // Call the new service method
        enabled: !!userId, // Only enable the query if userId exists
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
