import React from 'react';
import { Paper, Typography, Alert } from '@mui/material';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

interface BurnUpChartSectionProps {
  burnUpData: any[];
  isEnabled: boolean;
}

const BurnUpChartSection: React.FC<BurnUpChartSectionProps> = ({ burnUpData, isEnabled }) => (
  <Paper sx={{ flex: 1, height: 'auto', minHeight: 350, ml: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
    <Typography variant="h6" gutterBottom>
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
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={burnUpData} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="planned" stroke="#ac1754" strokeWidth={3} dot={false} name="Planned Points" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="completed" stroke="#F3A8C7" strokeWidth={3} dot={true} name="Completed Points" />
        </LineChart>
      </ResponsiveContainer>
    )}
  </Paper>
);

export default BurnUpChartSection; 