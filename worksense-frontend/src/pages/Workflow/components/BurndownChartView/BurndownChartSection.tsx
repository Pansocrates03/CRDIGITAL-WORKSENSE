import React from 'react';
import { Paper, Typography, Alert, Box } from '@mui/material';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

interface BurndownChartSectionProps {
  data: any[];
  title: string;
  isEnabled: boolean;
}

const BurndownChartSection: React.FC<BurndownChartSectionProps> = ({ data, title, isEnabled }) => (
  <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
    <Typography variant="h6" gutterBottom>
      {title}
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
        Burndown Chart is currently disabled for this project.
      </Alert>
    ) : (
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
              stroke="#ac1754"
              name="Remaining Work"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="idealBurndown"
              stroke="#F3A8C7"
              name="Ideal Burndown"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    )}
  </Paper>
);

export default BurndownChartSection; 