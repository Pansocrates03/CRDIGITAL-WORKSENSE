import React, { useMemo } from 'react';
import { Paper, Typography, Alert } from '@mui/material';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import BacklogItemType from '@/types/BacklogItemType';
import { addDays, format, isAfter } from 'date-fns';

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

// Helper function to convert size to story points based on scale
const getStoryPoints = (size: string, scale: "fibonacci" | "linear" | "tshirt" = "tshirt"): number => {
  if (scale === "fibonacci") {
    // For fibonacci scale, the size is already a number
    const points = parseInt(size);
    return isNaN(points) ? 0 : points;
  } else if (scale === "linear") {
    // For linear scale, the size is already a number
    const points = parseInt(size);
    return isNaN(points) ? 0 : points;
  } else {
    // Default to t-shirt sizes
    switch (size.toUpperCase()) {
      case 'XS': return 1;
      case 'S': return 2;
      case 'M': return 3;
      case 'L': return 5;
      case 'XL': return 8;
      default: return 0;
    }
  }
};

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

// Update Task interface to match BacklogItemType
type Task = Pick<BacklogItemType, 'id' | 'status' | 'size' | 'createdAt' | 'updatedAt'>;

interface BurnUpDataPoint {
  date: string;
  planned: number;
  completed: number;
}

interface BurnUpChartSectionProps {
  tasks: Task[];
  isEnabled: boolean;
  sprintStart?: Date;
  sprintEnd?: Date;
  storyPointScale?: "fibonacci" | "linear" | "tshirt";
}

const BurnUpChartSection: React.FC<BurnUpChartSectionProps> = ({ 
  tasks, 
  isEnabled, 
  sprintStart, 
  sprintEnd,
  storyPointScale = "tshirt" 
}) => {
  // Process tasks into burn up data
  const burnUpData = useMemo(() => {
    if (!tasks || tasks.length === 0 || !sprintStart || !sprintEnd) return [];

    // Generate all dates in the sprint
    const dateRange = getDateRange(sprintStart, sprintEnd);

    return dateRange.map((currentDate) => {
      // Planned points: all tasks created (or updated) on or before this date
      const plannedPoints = tasks
        .filter(task => {
          const taskDate = toDate(task.createdAt) || toDate(task.updatedAt);
          return taskDate && taskDate <= currentDate;
        })
        .reduce((sum, task) => sum + (task.size ? getStoryPoints(task.size, storyPointScale) : 0), 0);

      // Completed points: all tasks with status Done and updated (or created) on or before this date
      const completedPoints = tasks
        .filter(task => {
          const taskDate = toDate(task.updatedAt) || toDate(task.createdAt);
          return task.status === 'Done' && taskDate && !isAfter(taskDate, currentDate);
        })
        .reduce((sum, task) => sum + (task.size ? getStoryPoints(task.size, storyPointScale) : 0), 0);

      return {
        date: format(currentDate, 'yyyy-MM-dd'),
        planned: plannedPoints,
        completed: completedPoints
      };
    });
  }, [tasks, sprintStart, sprintEnd, storyPointScale]);

  return (
    <Paper sx={{ 
      flex: 1, 
      height: 'auto', 
      minHeight: 350, 
      ml: 2, 
      p: 3, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'flex-start' 
    }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', width: '100%' }}>
        Burn Up Chart
      </Typography>
      {!isEnabled ? (
        <Alert 
          severity="info" 
          sx={{ 
            mt: 2,
            backgroundColor: '#f3f4f6',
            '& .MuiAlert-icon': { color: '#ac1754' },
            '& .MuiAlert-message': { color: '#ac1754' }
          }}
        >
          Velocity Tracking is currently disabled for this project.
        </Alert>
      ) : burnUpData.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ 
            mt: 2,
            backgroundColor: '#f3f4f6',
            '& .MuiAlert-icon': { color: '#ac1754' },
            '& .MuiAlert-message': { color: '#ac1754' }
          }}
        >
          No data available for the Burn Up Chart. Add tasks with story points to see the chart.
        </Alert>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={burnUpData} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`${value} points`, '']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line 
              type="monotone" 
              dataKey="planned" 
              stroke="#ac1754" 
              strokeWidth={3} 
              dot={false} 
              name="Planned Points" 
              strokeDasharray="5 5" 
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#F3A8C7" 
              strokeWidth={3} 
              dot={true} 
              name="Completed Points" 
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default BurnUpChartSection; 