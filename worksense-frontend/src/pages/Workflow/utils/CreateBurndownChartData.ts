import BacklogItemType from "@/types/BacklogItemType";
import { format, addDays, isAfter } from "date-fns";

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

// Helper to generate all dates between start and end (inclusive)
function getDateRange(start: Date, end: Date): Date[] {
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
        dates.push(new Date(current));
        current = addDays(current, 1);
    }
    return dates;
}

export const createBurndownChartData = (
    tasks: BacklogItemType[],
    sprintStart: Date,
    sprintEnd: Date
): BurndownDataPoint[] => {
    if (!tasks || tasks.length === 0) return [];

    // Total story points in the sprint
    const totalPoints = tasks.reduce((sum, task) => sum + (task.size ? getStoryPoints(task.size) : 0), 0);

    // Generate all dates in the sprint
    const dateRange = getDateRange(sprintStart, sprintEnd);

    // Calculate ideal burndown line
    const totalDays = dateRange.length - 1;
    const pointsPerDay = totalPoints / (totalDays > 0 ? totalDays : 1);

    // For each day, calculate remaining work
    return dateRange.map((currentDate, idx) => {
        // Sum points of tasks completed (status 'done') up to and including this day
        const completedPoints = tasks
            .filter(task => {
                if (task.status !== 'done') return false;
                const doneDate = toDate(task.updatedAt) || toDate(task.createdAt);
                return doneDate && !isAfter(doneDate, currentDate);
            })
            .reduce((sum, task) => sum + (task.size ? getStoryPoints(task.size) : 0), 0);

        const remainingWork = Math.max(0, totalPoints - completedPoints);
        const idealBurndown = Math.max(0, totalPoints - pointsPerDay * idx);

        return {
            date: format(currentDate, 'yyyy-MM-dd'),
            remainingWork,
            idealBurndown
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