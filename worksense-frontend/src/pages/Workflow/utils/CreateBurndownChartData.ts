import BacklogItemType from "@/types/BacklogItemType";

interface burndown_chart_data {
    date: string,
    remainingWork: number,
    idealBurndown: number
}

const size2Number = {
    "XS": 1,
    "S": 2,
    "M": 3,
    "L": 5,
    "XL": 8
} 

export const createBurndownChartData = (userStories: BacklogItemType[]): burndown_chart_data[] => {
    let data: burndown_chart_data[] = [];

    // Get the total work for all the stories
    const totalWork = userStories.reduce((sum, story) => sum + (size2Number[story.size || "M"] || 0), 0);
    
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
        const completedStories = userStories.filter(story => 
            story.status === 'done' && 
            new Date(story.updatedAt || '') <= date
        );
        
        remainingWork = totalWork - completedStories.reduce((sum, story) => sum + (size2Number[story.size || "M"]  || 0), 0);
    }
    
    return data;
}