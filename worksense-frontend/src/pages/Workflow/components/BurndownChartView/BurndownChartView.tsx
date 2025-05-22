import React from 'react';
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
import { Box, Typography, Paper } from '@mui/material';

interface BurndownData {
  date: string;
  remainingWork: number;
  idealBurndown: number;
}

interface BurndownChartViewProps {
  data: BurndownData[];
  title?: string;
}

const BurndownChartView: React.FC<BurndownChartViewProps> = ({ data, title = 'Burndown Chart' }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="remainingWork"
              stroke="#8884d8"
              name="Remaining Work"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="idealBurndown"
              stroke="#82ca9d"
              name="Ideal Burndown"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default BurndownChartView;
