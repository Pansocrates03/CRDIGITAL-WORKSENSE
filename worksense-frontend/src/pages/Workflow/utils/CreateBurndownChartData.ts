import BacklogItemType from "@/types/BacklogItemType";
import { format } from "date-fns";

interface BurndownDataPoint {
    date: string;
    remainingWork: number;
    idealBurndown: number;
}

// Helper to convert Firestore timestamp or string/Date to JS Date
function toDate(val: any): Date | undefined {
    if (!val) return undefined;
    if (typeof val === 'object' && (val.seconds || val._seconds)) {
        // Firestore timestamp
        const seconds = val.seconds ?? val._seconds;
        return new Date(seconds * 1000);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
}

export const createBurndownChartData = (tasks: BacklogItemType[]): BurndownDataPoint[] => {
    if (!tasks || tasks.length === 0) return [];

    console.log("Tasks with fechas:", tasks.map(t => ({
        id: t.id,
        name: t.name,
        size: t.size,
        status: t.status,
        type: t.type,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
    })));

    // Get all unique dates from task creation and updates
    const dates = new Set<string>();
    tasks.forEach(task => {
        // Use createdAt, or fallback to updatedAt
        const created = toDate(task.createdAt) || toDate(task.updatedAt);
        if (created) {
            dates.add(created.toISOString().split('T')[0]);
        }
        const updated = toDate(task.updatedAt);
        if (updated) {
            dates.add(updated.toISOString().split('T')[0]);
        }
    });

    // Sort dates
    const sortedDates = Array.from(dates).sort();
    if (sortedDates.length === 0) return [];

    // Calculate total story points
    const totalPoints = tasks.reduce((sum, task) => sum + (task.size ? getStoryPoints(task.size) : 0), 0);

    // Calculate ideal burndown line
    const startDate = new Date(sortedDates[0]);
    const endDate = new Date(sortedDates[sortedDates.length - 1]);
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const pointsPerDay = totalPoints / totalDays;

    // Calculate actual burndown
    return sortedDates.map((date, index) => {
        const currentDate = new Date(date);
        const daysElapsed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate remaining work (total points minus completed points)
        const remainingWork = totalPoints - tasks
            .filter(task => {
                const taskDate = toDate(task.updatedAt) || toDate(task.createdAt);
                return task.status === 'done' && taskDate && taskDate <= currentDate;
            })
            .reduce((sum, task) => sum + (task.size ? getStoryPoints(task.size) : 0), 0);

        // Calculate ideal burndown
        const idealBurndown = Math.max(0, totalPoints - (pointsPerDay * daysElapsed));

        return {
            date: format(currentDate, 'yyyy-MM-dd'),
            remainingWork: Math.max(0, remainingWork),
            idealBurndown: Math.max(0, idealBurndown)
        };
    });
};

// Helper function to convert size to story points
const getStoryPoints = (size: string): number => {
    switch (size.toUpperCase()) {
        case 'XS': return 1;
        case 'S': return 2;
        case 'M': return 3;
        case 'L': return 5;
        case 'XL': return 8;
        default: return 0;
    }
};