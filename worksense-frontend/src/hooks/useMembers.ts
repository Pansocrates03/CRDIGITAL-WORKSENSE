// src/hooks/useMembers.ts

import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import MemberDetailed from '@/types/MemberDetailedType'; // Correct path

export function useMembers(projectId: string) {
  return useQuery<MemberDetailed[], Error>({
    queryKey: ['members', projectId],
    queryFn: () => projectService.fetchProjectMembersDetailed(projectId),
    staleTime: 1000 * 60 * 5, // 5 minutes (how long data is "fresh")
    gcTime: 1000 * 60 * 10,   // 10 minutes (garbage collection time = "cacheTime" in v5)
  });
}
