import React from "react";
import BacklogItemType from "@/types/BacklogItemType";
import { useParams } from "react-router-dom";
import { useSprints } from "@/hooks/useSprintData";
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

// Helper function to convert Firestore timestamp to Date
const toDate = (timestamp: any): Date | undefined => {
  if (!timestamp) return undefined;
  if (typeof timestamp === 'object' && (timestamp.seconds || timestamp._seconds)) {
    const seconds = timestamp.seconds ?? timestamp._seconds;
    return new Date(seconds * 1000);
  }
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? undefined : date;
};

const OverviewView: React.FC<OverviewViewProps> = ({ tasks }) => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: sprints } = useSprints(projectId ?? "");
  
  // Get active sprint
  const activeSprint = sprints?.find(sprint => sprint.status === "Active");

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

  // Calculate sprint progress
  const completedTasks = taskStats.byStatus['Done'] || 0;
  const progressPercentage = taskStats.total > 0 ? (completedTasks / taskStats.total) * 100 : 0;

  // Convert Firestore timestamps to Date objects
  const startDate = activeSprint ? toDate(activeSprint.startDate) : undefined;
  const endDate = activeSprint ? toDate(activeSprint.endDate) : undefined;

  // Calculate remaining days
  const today = new Date();
  const remainingDays = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;

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

  if (!activeSprint) {
    return (
      <div className="overview-view">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-semibold mb-4">No Active Sprint</h3>
          <p className="text-gray-600">There is no active sprint at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overview-view">
      {/* Sprint Information Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Progress Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Sprint Progress</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-pink-600">{progressPercentage.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-bold text-blue-600">{completedTasks} / {taskStats.total}</p>
            </div>
          </div>
        </div>

        {/* Dates Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Sprint Dates</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="text-lg font-medium">
                {startDate ? startDate.toLocaleDateString() : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">End Date</p>
              <p className="text-lg font-medium">
                {endDate ? endDate.toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Remaining Days Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Time Remaining</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Days Left</p>
              <p className="text-2xl font-bold text-pink-600">
                {remainingDays > 0 ? remainingDays : 'Sprint ended'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-medium">
                {remainingDays > 0 ? activeSprint.status : 'Completed'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
