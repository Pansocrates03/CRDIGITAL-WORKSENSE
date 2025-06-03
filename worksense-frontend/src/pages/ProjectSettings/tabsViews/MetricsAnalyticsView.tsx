import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const MetricsAnalyticsView: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch project data
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.fetchProjectDetails(projectId!),
    enabled: !!projectId,
  });

  // Local state for edit mode and metrics settings
  const [editMode, setEditMode] = useState(false);
  const [burndownChartEnabled, setBurndownChartEnabled] = useState(true);
  const [velocityTrackingEnabled, setVelocityTrackingEnabled] = useState(true);
  const [workloadHeatmapsEnabled, setWorkloadHeatmapsEnabled] = useState(true);

  // When project data loads, set local state
  useEffect(() => {
    if (project) {
      setBurndownChartEnabled((project as any).enableBurndownChart ?? true);
      setVelocityTrackingEnabled((project as any).enableVelocityTracking ?? true);
      setWorkloadHeatmapsEnabled((project as any).enableWorkloadHeatmaps ?? true);
    }
  }, [project]);

  // Save changes
  const mutation = useMutation({
    mutationFn: async (updated: any) => {
      await projectService.updateProject(projectId!, updated);
    },
    onSuccess: () => {
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Metrics settings updated successfully!");
    },
    onError: () => {
      setEditMode(false);
      toast.error("There was an error updating metrics settings");
    },
  });

  if (isLoading || !user || !project) return <div>Loading...</div>;

  const isProductOwner =
    project.ownerId == user.userId ||
    (Array.isArray(project.members) &&
      project.members.some(
        member =>
          String(member.userId) === String(user.userId) &&
          member.projectRoleId === "product-owner"
      ));

  const handleSave = () => {
    mutation.mutate({
      enableBurndownChart: burndownChartEnabled,
      enableVelocityTracking: velocityTrackingEnabled,
      enableWorkloadHeatmaps: workloadHeatmapsEnabled,
    });
  };

  return (
    <div className="metrics-analytics-view">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start mb-6">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Metrics & Analytics</CardTitle>
            <div className="text-muted-foreground mt-1">
              Configure which metrics and analytics features are enabled for this project.
            </div>
          </div>
          {isProductOwner && !editMode && (
            <Button onClick={() => setEditMode(true)}>Edit</Button>
          )}
          {isProductOwner && editMode && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditMode(false);
                  // Reset to last saved values
                  setBurndownChartEnabled((project as any).enableBurndownChart ?? true);
                  setVelocityTrackingEnabled((project as any).enableVelocityTracking ?? true);
                  setWorkloadHeatmapsEnabled((project as any).enableWorkloadHeatmaps ?? true);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Burndown Chart Toggle */}
          <div className="flex items-center gap-3">
            <Toggle
              checked={burndownChartEnabled}
              onCheckedChange={checked => isProductOwner && editMode && setBurndownChartEnabled(!!checked)}
              disabled={!isProductOwner || !editMode}
              id="burndown-chart"
            />
            <label htmlFor="burndown-chart" className="text-base font-medium">
              Burndown Chart
            </label>
          </div>

          {/* Velocity Tracking Toggle */}
          <div className="flex items-center gap-3">
            <Toggle
              checked={velocityTrackingEnabled}
              onCheckedChange={checked => isProductOwner && editMode && setVelocityTrackingEnabled(!!checked)}
              disabled={!isProductOwner || !editMode}
              id="velocity-tracking"
            />
            <label htmlFor="velocity-tracking" className="text-base font-medium">
              Burn Up Chart
            </label>
          </div>

          {/* Workload Heatmaps Toggle */}
          <div className="flex items-center gap-3">
            <Toggle
              checked={workloadHeatmapsEnabled}
              onCheckedChange={checked => isProductOwner && editMode && setWorkloadHeatmapsEnabled(!!checked)}
              disabled={!isProductOwner || !editMode}
              id="workload-heatmaps"
            />
            <label htmlFor="workload-heatmaps" className="text-base font-medium">
              Workload Heatmaps
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsAnalyticsView;