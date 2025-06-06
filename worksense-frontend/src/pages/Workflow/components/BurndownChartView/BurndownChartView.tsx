import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { Box, Typography, Paper, Alert } from '@mui/material';
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
  storyPointScale?: "fibonacci" | "linear" | "tshirt";
}

const BurndownChartView: React.FC<BurndownChartViewProps> = ({ data, title = 'Burndown Chart', doneItemsPerDay = [], tasks = [], sprintStart, sprintEnd, storyPointScale = "tshirt" }) => {
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


  const today = new Date();
  const startDate = new Date();
  startDate.setMonth(today.getMonth() - 3); // 3 months before today
  const endDate = today; // today is the last day


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
          storyPointScale={storyPointScale}
        />
      </Box>
    </Box>
  );
};

export default BurndownChartView;
