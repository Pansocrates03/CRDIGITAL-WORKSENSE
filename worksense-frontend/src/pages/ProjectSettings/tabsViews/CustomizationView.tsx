import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X, Plus, GripVertical } from "lucide-react";

const CustomizationView: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch project data
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.fetchProjectDetails(projectId!),
    enabled: !!projectId,
  });

  // Local state for edit mode and customization settings
  const [editMode, setEditMode] = useState(false);
  const [workflowStages, setWorkflowStages] = useState<string[]>(["To Do", "In Progress", "Done"]);
  const [tags, setTags] = useState<string[]>(["Done", "Sprint_backlog", "In_review", "In_Progress", "New"]);
  const [newStage, setNewStage] = useState("");
  const [newTag, setNewTag] = useState("");

  // When project data loads, set local state
  useEffect(() => {
    if (project) {
      setWorkflowStages((project as any).workflowStages ?? ["To Do", "In Progress", "Done"]);
      setTags((project as any).tags ?? ["Done", "Sprint_backlog", "In_review", "In_Progress", "New"]);
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
      toast.success("Customization settings updated successfully!");
    },
    onError: () => {
      setEditMode(false);
      toast.error("There was an error updating customization settings");
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
      workflowStages,
      tags,
    });
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reset to last saved values
    setWorkflowStages((project as any).workflowStages ?? ["To Do", "In Progress", "Done"]);
    setTags((project as any).tags ?? ["Done", "Sprint_backlog", "In_review", "In_Progress", "New"]);
  };

  const addWorkflowStage = () => {
    if (newStage.trim() && !workflowStages.includes(newStage.trim())) {
      setWorkflowStages([...workflowStages, newStage.trim()]);
      setNewStage("");
    }
  };

  const removeWorkflowStage = (stage: string) => {
    if (workflowStages.length > 1) {
      setWorkflowStages(workflowStages.filter(s => s !== stage));
    } else {
      toast.error("At least one workflow stage is required");
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="customization-view">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start mb-6">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Customization</CardTitle>
            <div className="text-muted-foreground mt-1">
              Customize your project's workflow stages and tags to better organize and track your work.
            </div>
          </div>
          {isProductOwner && !editMode && (
            <Button onClick={() => setEditMode(true)}>Edit</Button>
          )}
          {isProductOwner && editMode && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Workflow Stages Card */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-start mb-6">
              <div>
                <CardTitle className="text-xl font-bold text-foreground">Workflow Stages</CardTitle>
                <div className="text-muted-foreground mt-1">
                  Customize the stages of your project workflow.
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {workflowStages.map((stage, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2"
                    draggable={isProductOwner && editMode}
                    onDragStart={e => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", index.toString());
                    }}
                    onDragOver={e => {
                      if (isProductOwner && editMode) e.preventDefault();
                    }}
                    onDrop={e => {
                      if (!(isProductOwner && editMode)) return;
                      e.preventDefault();
                      const from = Number(e.dataTransfer.getData("text/plain"));
                      if (from === index) return;
                      const updated = [...workflowStages];
                      const [removed] = updated.splice(from, 1);
                      updated.splice(index, 0, removed);
                      setWorkflowStages(updated);
                    }}
                    style={{ cursor: isProductOwner && editMode ? "grab" : undefined }}
                  >
                    {isProductOwner && editMode && (
                      <GripVertical className="h-5 w-5 text-muted-foreground mr-1" />
                    )}
                    <div className="flex-1 p-2 bg-[var(--neutral-100)] rounded border">
                      {stage}
                    </div>
                    {isProductOwner && editMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWorkflowStage(stage)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {isProductOwner && editMode && (
                <div className="flex gap-2">
                  <Input
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    placeholder="Add new stage..."
                    className="flex-1"
                  />
                  <Button onClick={addWorkflowStage} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags Card */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-start mb-6">
              <div>
                <CardTitle className="text-xl font-bold text-foreground">Project Tags</CardTitle>
                <div className="text-muted-foreground mt-1">
                  Manage tags for categorizing and organizing project items.
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-[var(--neutral-100)] px-3 py-1 rounded-full border"
                  >
                    <span>{tag}</span>
                    {isProductOwner && editMode && (
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isProductOwner && editMode && (
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add new tag..."
                    className="flex-1"
                  />
                  <Button onClick={addTag} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomizationView;