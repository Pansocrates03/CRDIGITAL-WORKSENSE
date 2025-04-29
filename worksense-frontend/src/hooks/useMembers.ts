import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import MemberDetailed from '@/types/MemberDetailedType';

export function useMembers(projectId: string) {
  return useQuery<MemberDetailed[], Error>({
    queryKey: ['members', projectId],
    queryFn: () => projectService.fetchProjectMembersDetailed(projectId),
    enabled: !!projectId, // Only fetch if projectId exists
    refetchOnWindowFocus: false, // Don't force on tab focus
    staleTime: 0, // Always allow revalidation based on HTTP cache (important)
  });
}
