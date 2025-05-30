import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { endpoints } from "@/lib/constants/endpoints"; // Ensure path is correct
import { Story } from "@/types/StoryType";           // Ensure path is correct
import apiClient from "@/api/apiClient";               // Import your apiClient

// Define the shape of the data passed to create a story
// Assumes 'id' is server-generated.
// If 'projectId' is part of your Story type but not needed in the POST payload
// (because it's in the URL), you might also Omit it here: Omit<Story, "id" | "projectId">
type CreateStoryPayload = Omit<Story, "id">;

// Define the return type for the hook
type UseStoriesReturn = UseQueryResult<Story[], Error> & {
    addStory: (storyData: CreateStoryPayload) => Promise<Story>;
    updateStory: (storyData: Story) => Promise<Story>;
    deleteStory: (storyId: string) => Promise<void>;
};

export const useStories = (projectId: string): UseStoriesReturn => {
    const queryClient = useQueryClient();

    // Consistent query key for this project's stories
    const storiesQueryKey: ["stories", string] = ["stories", projectId];

    const query = useQuery<Story[], Error, Story[], ["stories", string]>({
        queryKey: storiesQueryKey,
        queryFn: async () => {
            if (!projectId) {
                return []; // Or throw, or handle as per your app's logic
            }
            // apiClient.get will throw for non-2xx responses
            const response = await apiClient.get<Story[]>(endpoints.getStories(projectId));
            return response.data; // Axios response.data is already parsed JSON
        },
        enabled: !!projectId, // Only run the query if projectId is truthy
    });

    const addStory = async (storyData: CreateStoryPayload): Promise<Story> => {
        try {
            // apiClient.post handles JSON.stringify and Content-Type
            const response = await apiClient.post<Story>(
                endpoints.createStory(projectId),
                storyData // Pass the story data (without id)
            );

            // Invalidate the query for this project's stories to refetch
            queryClient.invalidateQueries({ queryKey: storiesQueryKey });
            // For more advanced UX, consider optimistic updates:
            // queryClient.setQueryData(storiesQueryKey, (oldData?: Story[]) => [...(oldData ?? []), response.data]);

            return response.data; // Assuming API returns the created story
        } catch (error) {
            console.error("Failed to create story:", error);
            throw error; // Re-throw to be handled by the caller or React Query
        }
    };

    const updateStory = async (storyData: Story): Promise<Story> => {
        try {
            // apiClient.put handles JSON.stringify and Content-Type
            const response = await apiClient.put<Story>(
                endpoints.updateStory(projectId, storyData.id),
                storyData // Pass the full story data for update
            );

            // Invalidate the query.
            // Optimistic update example:
            // queryClient.setQueryData(storiesQueryKey, (oldData?: Story[]) =>
            //   oldData?.map(s => s.id === storyData.id ? response.data : s) ?? []
            // );
            queryClient.invalidateQueries({ queryKey: storiesQueryKey });

            return response.data; // Assuming API returns the updated story
        } catch (error) {
            console.error("Failed to update story:", error);
            throw error;
        }
    };

    const deleteStory = async (storyId: string): Promise<void> => {
        try {
            await apiClient.delete(endpoints.deleteStory(projectId, storyId));

            // Invalidate the query.
            // Optimistic update example:
            // queryClient.setQueryData(storiesQueryKey, (oldData?: Story[]) =>
            //   oldData?.filter(s => s.id !== storyId) ?? []
            // );
            queryClient.invalidateQueries({ queryKey: storiesQueryKey });
        } catch (error) {
            console.error("Failed to delete story:", error);
            throw error;
        }
    };

    return {
        ...query,
        addStory,
        updateStory,
        deleteStory,
    };
};