import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography, Paper, Alert } from '@mui/material';
import HeatMap from '@uiw/react-heat-map';
import HeatmapTooltip from '@uiw/react-tooltip';
import BurndownChartSection from './BurndownChartSection';
import WorkloadHeatmapSection from './WorkloadHeatmapSection';
import BurnUpChartSection from './BurnUpChartSection';
import BacklogItemType from '@/types/BacklogItemType';

interface BurndownData {
  date: string;
  remainingWork: number;
  idealBurndown: number;
}

// Update Task interface to match BacklogItemType
type Task = Pick<BacklogItemType, 'id' | 'status' | 'size' | 'createdAt' | 'updatedAt'>;

interface BurndownChartViewProps {
  data: BurndownData[];
  title?: string;
  doneItemsPerDay?: { date: string; count: number }[];
  tasks: Task[];
  sprintStart?: Date;
  sprintEnd?: Date;
}

const BurndownChartView: React.FC<BurndownChartViewProps> = ({ data, title = 'Burndown Chart', doneItemsPerDay = [], tasks = [], sprintStart, sprintEnd }) => {
  console.log("BurndownChartView props - tasks:", tasks);
  console.log("BurndownChartView props - data (burndownChartData):", data);
  const { id: projectId } = useParams<{ id: string }>();
  
  // Fetch project data to check visibility settings
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.fetchProjectDetails(projectId!),
    enabled: !!projectId,
  });

  // Check if features are enabled
  const isBurndownEnabled = project?.enableBurndownChart ?? true;
  const isVelocityEnabled = project?.enableVelocityTracking ?? true;
  const isHeatmapEnabled = project?.enableWorkloadHeatmaps ?? true;

  // Data format check and debug
  console.log('doneItemsPerDay for heatmap:', doneItemsPerDay);

  // Transform data for react-heatmap if needed
  // react-heatmap expects an array of { date: 'YYYY-MM-DD', count: number }
  const heatmapData = Array.isArray(doneItemsPerDay)
    ? doneItemsPerDay.map(d => ({ ...d, date: d.date }))
    : [];

  // Color palette: from light gray to your brand's primary color
  // You can further customize this palette as needed
  const colorArray = [
    '#f3f4f6', // lightest
    '#c7d2fe',
    '#818cf8',
    '#6366f1',
    '#4338ca', // darkest (brand primary)
  ];

  const today = new Date();
  const startDate = new Date();
  startDate.setMonth(today.getMonth() - 3); // 3 months before today
  const endDate = today; // today is the last day

  // Sample data for Burn Up Chart
  const burnUpData = [
    { date: '4/3/2023', planned: 22, completed: 0 },
    { date: '4/4/2023', planned: 22, completed: 0 },
    { date: '4/5/2023', planned: 22, completed: 2 },
    { date: '4/6/2023', planned: 22, completed: 8 },
    { date: '4/7/2023', planned: 22, completed: 12 },
    { date: '4/8/2023', planned: 22, completed: 12 },
    { date: '4/9/2023', planned: 22, completed: 12 },
    { date: '4/10/2023', planned: 22, completed: 12 },
    { date: '4/11/2023', planned: 22, completed: 12 },
    { date: '4/12/2023', planned: 22, completed: 11 },
    { date: '4/13/2023', planned: 24, completed: 15 },
    { date: '4/14/2023', planned: 25, completed: 22 },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Top: Burndown Chart (full width) */}
      <BurndownChartSection
        data={data}
        title={title}
        isEnabled={isBurndownEnabled}
      />
      {/* Bottom: Two side-by-side containers */}
      <Box sx={{ display: 'flex', width: '100%', mt: 4 }}>
        {/* Left: Heatmap */}
        <WorkloadHeatmapSection
          heatmapData={heatmapData}
          isEnabled={isHeatmapEnabled}
          startDate={startDate}
          endDate={endDate}
        />
        {/* Right: Burn Up Chart */}
        <BurnUpChartSection
          tasks={tasks}
          isEnabled={isVelocityEnabled}
          sprintStart={sprintStart}
          sprintEnd={sprintEnd}
        />
      </Box>
    </Box>
  );
};

export default BurndownChartView;
