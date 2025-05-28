import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProject, useUpdateProject } from "@/hooks/useProjects";

const DAYS_OF_WEEK = [
  { id: "monday", label: "Mon" },
  { id: "tuesday", label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday", label: "Thu" },
  { id: "friday", label: "Fri" },
  { id: "saturday", label: "Sat" },
  { id: "sunday", label: "Sun" },
] as const;

const SPRINT_DURATIONS = [
  { value: "1", label: "1 Week" },
  { value: "2", label: "2 Weeks" },
  { value: "3", label: "3 Weeks" },
  { value: "4", label: "4 Weeks" },
] as const;

const STORY_POINT_SCALES = [
  { value: "fibonacci", label: "Fibonacci (1, 2, 3, 5, 8, 13, 21)" },
  { value: "linear", label: "Linear (1, 2, 3, 4, 5, 6, 7, 8)" },
  { value: "tshirt", label: "T-Shirt Sizes (XS, S, M, L, XL, XXL)" },
] as const;

type StoryPointScale = typeof STORY_POINT_SCALES[number]["value"];
type SprintDuration = typeof SPRINT_DURATIONS[number]["value"];

const ScrumSettingsView: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: user } = useAuth();

  // Fetch project data
  const { data: project, isLoading, isError } = useProject(projectId!);
  const updateProject = useUpdateProject({
    onSuccess: () => {
      setEditMode(false);
      toast.success("Scrum settings updated successfully!");
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if(isError) return <div>Error loading project data</div>;
  if (!project) return <div>Project not found</div>;
  

  // Local state for edit mode and scrum settings
  const [editMode, setEditMode] = useState(false);
  const [sprintDuration, setSprintDuration] = useState<SprintDuration>("2");
  const [workingDays, setWorkingDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday"]);
  const [storyPointScale, setStoryPointScale] = useState<StoryPointScale>("tshirt");

  // When project data loads, set local state
  useEffect(() => {
    if (project) {
      setSprintDuration((project as any).sprintDuration?.toString() ?? "2");
      setWorkingDays((project as any).workingDays ?? ["monday", "tuesday", "wednesday", "thursday", "friday"]);
      setStoryPointScale((project as any).storyPointScale ?? "tshirt");
    }
  }, [project]);

  const isProductOwner =
    project.ownerId == user.id ||
    (Array.isArray(project.members) &&
      project.members.some(
        member =>
          String(member.userId) === String(user.id) &&
          member.projectRoleId === "product-owner"
      ));

  const handleSave = () => {
    updateProject.mutate({
      id: projectId!,
      data: {
        ...project,
        sprintDuration,
        workingDays,
        storyPointScale,
      },
    });
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reset to last saved values
    setSprintDuration((project as any).sprintDuration?.toString() ?? "2");
    setWorkingDays((project as any).workingDays ?? ["monday", "tuesday", "wednesday", "thursday", "friday"]);
    setStoryPointScale((project as any).storyPointScale ?? "tshirt");
  };

  const toggleWorkingDay = (dayId: string) => {
    if (workingDays.includes(dayId)) {
      if (workingDays.length > 1) {
        setWorkingDays(workingDays.filter(day => day !== dayId));
      } else {
        toast.error("At least one working day must be selected");
      }
    } else {
      setWorkingDays([...workingDays, dayId]);
    }
  };

  return (
    <div className="scrum-settings-view">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start mb-6">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Scrum Settings</CardTitle>
            <div className="text-muted-foreground mt-1">
              Configure your project's sprint duration, working days, and story point scale.
            </div>
          </div>
          {isProductOwner && !editMode && (
            <Button onClick={() => setEditMode(true)}>Edit</Button>
          )}
          {isProductOwner && editMode && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sprint Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Sprint Duration</label>
            <Select
              value={sprintDuration}
              onValueChange={(value: SprintDuration) => isProductOwner && editMode && setSprintDuration(value)}
              disabled={!isProductOwner || !editMode}
            >
              <SelectTrigger className="w-[200px] rounded-lg border border-input bg-background px-3 py-2 text-base font-medium focus:ring-2 focus:ring-[#ac1754]">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {SPRINT_DURATIONS.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value} className="text-base">
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Working Days */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Working Days</label>
            <div className="flex gap-3">
              {DAYS_OF_WEEK.map((day) => {
                const selected = workingDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    disabled={!isProductOwner || !editMode}
                    onClick={() => {
                      if (!isProductOwner || !editMode) return;
                      toggleWorkingDay(day.id);
                    }}
                    className={cn(
                      "rounded-md h-10 px-4 border text-base font-medium transition-colors focus:outline-none flex items-center justify-center",
                      selected
                        ? "bg-[#ac1754] text-white border-[#ac1754] shadow"
                        : "bg-white text-foreground border-input hover:bg-accent hover:text-foreground",
                      (!isProductOwner || !editMode) && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Story Points Scale */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Story Points Scale</label>
            <Select
              value={storyPointScale}
              onValueChange={(value: StoryPointScale) => isProductOwner && editMode && setStoryPointScale(value)}
              disabled={!isProductOwner || !editMode}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a scale" />
              </SelectTrigger>
              <SelectContent>
                {STORY_POINT_SCALES.map((scale) => (
                  <SelectItem key={scale.value} value={scale.value}>
                    {scale.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrumSettingsView;