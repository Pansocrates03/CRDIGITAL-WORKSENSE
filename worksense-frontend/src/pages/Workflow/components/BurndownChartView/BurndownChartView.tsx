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
import HeatMap from '@uiw/react-heat-map';
import HeatmapTooltip from '@uiw/react-tooltip';

interface BurndownData {
  date: string;
  remainingWork: number;
  idealBurndown: number;
}

interface BurndownChartViewProps {
  data: BurndownData[];
  title?: string;
  doneItemsPerDay?: { date: string; count: number }[];
}

const BurndownChartView: React.FC<BurndownChartViewProps> = ({ data, title = 'Burndown Chart', doneItemsPerDay = [] }) => {
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

      {/* Bottom: Two side-by-side containers */}
      <Box sx={{ display: 'flex', width: '100%', mt: 4 }}>
        {/* Left: Heatmap */}
        <Paper sx={{ 
          flex: 1, 
          height: 'auto', 
          minHeight: 350, 
          mr: 2, 
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', width: '100%' }}>
            Done Items Heatmap
          </Typography>
          <Box sx={{ 
            width: '100%', 
            overflowX: 'auto', 
            minHeight: 350,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Box sx={{ 
              width: '100%',
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              '& .react-calendar-heatmap': {
                width: '100% !important',
                maxWidth: '100%'
              }
            }}>
              {heatmapData.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  color: '#888', 
                  py: 4, 
                  border: '1px dashed #ccc', 
                  borderRadius: 2,
                  width: '100%'
                }}>
                  Heatmap of "Done" items per day will appear here (GitHub-style)
                </Box>
              ) : (
                <HeatMap
                  value={heatmapData}
                  weekLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                  startDate={startDate}
                  endDate={endDate}
                  panelColors={{
                    0: '#FBE8F0',
                    1: '#F3A8C7',
                    2: '#E74C8B',
                    3: '#DD1E6C',
                    4: '#AC1754',
                  }}
                  rectProps={{
                    rx: 4,
                  }}
                  rectSize={32}
                  legendCellSize={32}
                  height={300}
                  style={{ 
                    margin: '0 auto',
                    width: '100%'
                  }}
                  rectRender={(props, data) => (
                    <HeatmapTooltip placement="top" content={`Date: ${data.date} | Done: ${data.count || 0}`}>
                      <rect {...props} />
                    </HeatmapTooltip>
                  )}
                />
              )}
            </Box>
          </Box>
        </Paper>
        {/* Right: Velocity Tracking */}
        <Paper sx={{ flex: 1, height: 'auto', minHeight: 350, ml: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <Typography variant="h6" gutterBottom>
            Burn Up Chart
          </Typography>
          {/* Burn Up Chart */}
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
        </Paper>
      </Box>
    </Box>
  );
};

export default BurndownChartView;
