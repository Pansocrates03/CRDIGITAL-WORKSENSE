import React, { useMemo, useState } from 'react';
import { Paper, Typography, Alert, Box, Tooltip } from '@mui/material';
import { format, addDays, startOfWeek, endOfWeek, getMonth } from 'date-fns';

interface WorkloadHeatmapSectionProps {
  heatmapData: { date: string; count: number }[];
  isEnabled: boolean;
  startDate: Date;
  endDate: Date;
}

// Color palette (same as other charts, from light to dark)
const colorArray = [
  '#FBE8F0', // lightest
  '#F3A8C7',
  '#E74C8B',
  '#DD1E6C',
  '#ac1754', // darkest
];

// Helper to get color based on count
function getColor(count: number) {
  if (count === 0) return colorArray[0];
  if (count === 1) return colorArray[1];
  if (count === 2) return colorArray[2];
  if (count === 3) return colorArray[3];
  return colorArray[4];
}

// Helper to generate all days in the sprint
function getAllDays(start: Date, end: Date) {
  const days = [];
  let current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current = addDays(current, 1);
  }
  return days;
}

// Helper to group days by week (for GitHub style)
function groupByWeeks(days: Date[]) {
  const weeks: Date[][] = [];
  let week: Date[] = [];
  days.forEach((day, idx) => {
    if (week.length === 0) {
      // Start new week on Sunday
      const start = startOfWeek(day, { weekStartsOn: 0 });
      let d = new Date(start);
      while (d < day) {
        week.push(undefined as any); // Fill empty days
        d = addDays(d, 1);
      }
    }
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length > 0) {
    while (week.length < 7) week.push(undefined as any);
    weeks.push(week);
  }
  return weeks;
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WorkloadHeatmapSection: React.FC<WorkloadHeatmapSectionProps> = ({ heatmapData, isEnabled, startDate, endDate }) => {
  // Map date string to count for fast lookup
  const countMap = useMemo(() => {
    const map: Record<string, number> = {};
    heatmapData.forEach(d => { map[d.date] = d.count; });
    return map;
  }, [heatmapData]);

  // Adjust range to always show full weeks (GitHub style)
  const heatmapStart = useMemo(() => startOfWeek(startDate, { weekStartsOn: 0 }), [startDate]);
  const heatmapEnd = useMemo(() => endOfWeek(endDate, { weekStartsOn: 0 }), [endDate]);

  // Generate all days in the adjusted range
  const allDays = useMemo(() => getAllDays(heatmapStart, heatmapEnd), [heatmapStart, heatmapEnd]);
  const weeks = useMemo(() => groupByWeeks(allDays), [allDays]);

  // Month label logic: only show for first day of month in sprint range
  const monthLabelPositions = useMemo(() => {
    const positions: { idx: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, colIdx) => {
      for (let rowIdx = 0; rowIdx < 7; rowIdx++) {
        const day = week[rowIdx];
        if (
          day &&
          day >= startDate &&
          day <= endDate &&
          getMonth(day) !== lastMonth &&
          (rowIdx === 0 || !week[rowIdx - 1] || getMonth(week[rowIdx - 1]) !== getMonth(day))
        ) {
          positions.push({ idx: colIdx, label: monthLabels[getMonth(day)] });
          lastMonth = getMonth(day);
          break;
        }
      }
    });
    return positions;
  }, [weeks, startDate, endDate]);

  // Sizing
  const cellSize = 28;
  const cellGap = 6;
  const labelWidth = 40;

  // Tooltip state
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);

  return (
    <Paper sx={{ flex: 1, height: 'auto', minHeight: 400, mr: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
        <Box sx={{ width: '100%', overflowX: 'auto', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Month labels */}
          <Box sx={{ display: 'flex', flexDirection: 'row', ml: labelWidth, mb: 1 }}>
            <Box sx={{ width: labelWidth }} />
            {weeks.map((week, colIdx) => {
              // Only show month label if the first day in the column is in the sprint and is the first of the month in the grid
              const firstDayInSprint = week.find(day => day && day >= startDate && day <= endDate);
              const monthLabel = monthLabelPositions.find(m => m.idx === colIdx);
              return (
                <Box
                  key={colIdx}
                  sx={{
                    width: cellSize,
                    textAlign: 'center',
                    fontSize: 14,
                    color: '#888',
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {monthLabel && firstDayInSprint ? monthLabel.label : ''}
                </Box>
              );
            })}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: `${cellGap}px` }}>
            {/* Day labels */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${cellGap}px`, mr: 1 }}>
              {dayLabels.map((label, i) => (
                <Box key={label} sx={{ height: cellSize, width: labelWidth, textAlign: 'right', fontSize: 14, color: '#888', fontWeight: 600, pr: 1, lineHeight: `${cellSize}px` }}>{label}</Box>
              ))}
            </Box>
            {/* Heatmap grid */}
            {weeks.map((week, wIdx) => (
              <Box key={wIdx} sx={{ display: 'flex', flexDirection: 'column', gap: `${cellGap}px` }}>
                {week.map((day, dIdx) => {
                  if (!day) return <Box key={dIdx} sx={{ width: cellSize, height: cellSize, background: 'transparent', borderRadius: cellSize / 2 }} />;
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isInSprint = day >= startDate && day <= endDate;
                  const count = isInSprint ? (countMap[dateStr] || 0) : 0;
                  if (!isInSprint) {
                    return <Box key={dIdx} sx={{ width: cellSize, height: cellSize, background: 'transparent', borderRadius: cellSize / 2 }} />;
                  }
                  return (
                    <Tooltip key={dIdx} title={<span>{dateStr}<br/>Done: {count}</span>} arrow>
                      <Box
                        sx={{
                          width: cellSize,
                          height: cellSize,
                          background: getColor(count),
                          borderRadius: cellSize / 2,
                          border: '1px solid #f3f4f6',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            ))}
          </Box>
          {/* Color legend */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 3, gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#888', mr: 1 }}>Less</Typography>
            {[0, 1, 2, 3, 4].map((count, idx) => (
              <Box key={count} sx={{ width: 28, height: 28, background: colorArray[idx], borderRadius: 14, border: '1px solid #f3f4f6', mx: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#888' }}>
                {count < 4 ? count : '4+'}
              </Box>
            ))}
            <Typography variant="body2" sx={{ color: '#888', ml: 1 }}>More</Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default WorkloadHeatmapSection; 