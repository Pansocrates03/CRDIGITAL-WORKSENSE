// src/hooks/useSprintData.ts

import { useQuery } from "@tanstack/react-query";
import { sprintService } from "../services/sprintService";
import { Sprint } from "../types/SprintType";

/**
 * Custom hook to fetch all sprints for a project
 * @param projectId - The ID of the project to fetch sprints for
 * @returns Query result with sprints data, loading state, error state
 */
export const useAllSprints = (projectId?: string) => {
  return useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => {
      if (!projectId) {
        return Promise.resolve([]);
      }
      return sprintService.getAllSprintsForProject(projectId);
    },
    enabled: !!projectId,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Custom hook to fetch relevant sprints (active + planned) for a project
 * This is used on the SprintPage to populate the sprint selector
 * @param projectId - The ID of the project to fetch sprints for
 * @returns Query result with filtered sprints data, loading state, error state
 */
export const useRelevantSprints = (projectId?: string) => {
  const result = useAllSprints(projectId);

  // Filter sprints to show only active and planned
  const filteredData =
    (result.data as Sprint[])?.filter((sprint: Sprint) =>
      ["Active", "Planned"].includes(sprint.status)
    ) || [];

  // Sort sprints by status (Active first) then by start date (ascending)
  const sortedData = [...filteredData].sort((a, b) => {
    // First sort by status (Active first)
    if (a.status === "Active" && b.status !== "Active") return -1;
    if (a.status !== "Active" && b.status === "Active") return 1;

    // Then sort by start date
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateA - dateB;
  });

  return {
    ...result,
    data: sortedData,
  };
};

/**
 * Custom hook to fetch details for a specific sprint
 * @param projectId - The ID of the project
 * @param sprintId - The ID of the sprint to fetch details for
 * @returns Query result with sprint data, loading state, error state
 */
export const useSprintDetails = (projectId?: string, sprintId?: string) => {
  return useQuery({
    queryKey: ["sprint", projectId, sprintId],
    queryFn: () => {
      if (!projectId || !sprintId) {
        throw new Error("Project ID and Sprint ID are required");
      }
      return sprintService.getSprintDetails(projectId, sprintId);
    },
    enabled: !!projectId && !!sprintId,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
