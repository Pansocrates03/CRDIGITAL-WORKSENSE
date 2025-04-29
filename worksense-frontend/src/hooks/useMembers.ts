import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import MemberDetailed from '@/types/MemberDetailedType';

export function useMembers(projectId: string) {
  return useQuery<MemberDetailed[], Error>({
    queryKey: ['members', projectId],
    queryFn: () => projectService.fetchProjectMembersDetailed(projectId),
    enabled: !!projectId, // Only fetch if projectId exists
  });
}
