import React from "react";
import BacklogItemType from "@/types/BacklogItemType";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './OverviewView.css';

interface OverviewViewProps {
  tasks: BacklogItemType[];
}

const OverviewView: React.FC<OverviewViewProps> = ({ tasks }) => {
  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    byStatus: tasks.reduce((acc, task) => {
      const status = task.status || 'Not Set';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byType: tasks.reduce((acc, task) => {
      const type = task.type || 'Not Set';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Prepare data for charts
  const statusData = Object.entries(taskStats.byStatus).map(([name, value]) => ({
    name,
    value
  }));

  const typeData = Object.entries(taskStats.byType).map(([name, value]) => ({
    name,
    value
  }));

  // Colors for charts matching the project's color palette with opacity
  const COLORS = {
    active: 'rgba(59, 130, 246, 0.8)', // blue
    completed: 'rgba(34, 197, 94, 0.8)', // green
    planned: 'rgba(172, 23, 84, 0.8)', // pink
    default: 'rgba(172, 23, 84, 0.8)' // pink
  };

  // Function to get color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return COLORS.active;
      case 'done':
        return COLORS.completed;
      case 'to do':
        return COLORS.planned;
      default:
        return COLORS.default;
    }
  };

  return (
    <div className="overview-view">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Tasks by Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Type Distribution Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Tasks by Type</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={COLORS.planned} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
