import React from 'react';
import { Paper, Typography, Alert, Box } from '@mui/material';
import HeatMap from '@uiw/react-heat-map';
import HeatmapTooltip from '@uiw/react-tooltip';

interface WorkloadHeatmapSectionProps {
  heatmapData: any[];
  isEnabled: boolean;
  startDate: Date;
  endDate: Date;
}

const WorkloadHeatmapSection: React.FC<WorkloadHeatmapSectionProps> = ({ heatmapData, isEnabled, startDate, endDate }) => (
  <Paper sx={{ flex: 1, height: 'auto', minHeight: 350, mr: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', width: '100%' }}>
      Done Items Heatmap
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
        Workload Heatmap is currently disabled for this project.
      </Alert>
    ) : (
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
                4: '#ac1754',
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
    )}
  </Paper>
);

export default WorkloadHeatmapSection; 