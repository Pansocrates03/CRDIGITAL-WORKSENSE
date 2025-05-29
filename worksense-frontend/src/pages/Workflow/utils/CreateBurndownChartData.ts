import { Story } from "@/types/StoryType";

interface burndown_chart_data {
    date: string,
    remainingWork: number,
    idealBurndown: number
}

export const createBurndownChartData = (stories: Story[]): burndown_chart_data[] => {
    let data: burndown_chart_data[] = [];

    // Get the total work for all the stories
    const totalWork = stories.reduce((sum, story) => sum + (story.storyPoints || 0), 0);
    
    // Calculate ideal burndown rate per day
    const sprintDuration = 14; // Assuming 2-week sprints
    const idealBurndownRate = totalWork / sprintDuration;

    // Create the data points
    let remainingWork = totalWork;
    const today = new Date();
    
    for (let i = 0; i <= sprintDuration; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        data.push({
            date: date.toISOString().split('T')[0],
            remainingWork: remainingWork,
            idealBurndown: Math.max(0, totalWork - (idealBurndownRate * i))
        });
        
        // Update remaining work based on completed stories
        const completedStories = stories.filter(story => 
            story.status === 'done' && 
            new Date(story.updatedAt || '') <= date
        );
        
        remainingWork = totalWork - completedStories.reduce((sum, story) => sum + (story.storyPoints || 0), 0);
    }
    
    return data;
}