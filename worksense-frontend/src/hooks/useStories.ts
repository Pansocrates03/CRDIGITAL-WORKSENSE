import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/constants/endpoints";
import { Story } from "@/types/StoryType";

export const useStories = (projectId: string) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["stories", projectId],
        queryFn: async () => {
            const response = await fetch(endpoints.getStories(projectId));
            if (!response.ok) {
                throw new Error('Failed to fetch stories');
            }
            return response.json() as Promise<Story[]>;
        },
    });
    const addStory = async (story: { name: string }) => {};

    const deleteStory = async (storyId: string) => {
        const response = await fetch(endpoints.deleteStory(projectId, storyId), {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete story');
        }
        queryClient.invalidateQueries({ queryKey: ["stories"] });
    };

    return {
        ...query,
        addStory,
        deleteStory
    }
};