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

  return (
    <>
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
      {/* Heatmap in its own container below the burndown chart */}
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Done Items Heatmap
        </Typography>
        <Box sx={{ width: '100%', maxHeight: 400, overflowY: 'auto', overflowX: 'auto' }}>
          <Box sx={{ display: 'inline-block' }}>
            {heatmapData.length === 0 ? (
              <Box sx={{ textAlign: 'center', color: '#888', py: 4, border: '1px dashed #ccc', borderRadius: 2 }}>
                Heatmap of "Done" items per day will appear here (GitHub-style)
              </Box>
            ) : (
              <HeatMap
                value={heatmapData}
                weekLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                startDate={heatmapData[0] ? new Date(heatmapData[0].date) : undefined}
                panelColors={{
                  0: '#f3f4f6',
                  1: '#c7d2fe',
                  2: '#818cf8',
                  3: '#6366f1',
                  4: '#4338ca',
                }}
                rectProps={{
                  rx: 4, // rounded corners
                }}
                rectSize={16}
                legendCellSize={18}
                width={1200}
                style={{ margin: '0 auto' }}
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
    </>
  );
};

export default BurndownChartView;
