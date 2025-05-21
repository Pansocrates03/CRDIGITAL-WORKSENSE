import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AISettingsView: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch project data
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.fetchProjectDetails(projectId!),
    enabled: !!projectId,
  });

  // Local state for edit mode and AI settings
  const [editMode, setEditMode] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiContext, setAiContext] = useState("");
  const [aiTechStack, setAiTechStack] = useState("");

  // When project data loads, set local state (replace with real fields if available)
  useEffect(() => {
    if (project) {
      setAiEnabled((project as any).enableAiSuggestions ?? true);
      setAiContext((project as any).aiContext ?? "");
      setAiTechStack((project as any).aiTechStack ?? "");
    }
  }, [project]);

  // Save changes (replace with real API call when backend is ready)
  const mutation = useMutation({
    mutationFn: async (updated: any) => {
      await projectService.updateProject(projectId!, updated);
    },
    onSuccess: () => {
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("AI settings updated successfully!");
    },
    onError: () => {
      setEditMode(false);
      toast.error("There was an error updating AI settings");
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
      ...project,
      aiContext: aiContext ?? "",
      aiTechStack: aiTechStack ?? "",
      enableAiSuggestions: aiEnabled ?? false,
    });
  };

  return (
    <div className="general-info-view">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start mb-6">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">AI Settings</CardTitle>
            <div className="text-muted-foreground mt-1">
              Configure how AI features work for this project.
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
                  setAiEnabled((project as any).enableAiSuggestions ?? true);
                  setAiContext((project as any).aiContext ?? "");
                  setAiTechStack((project as any).aiTechStack ?? "");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable AI Suggestions */}
          <div className="flex items-center gap-3">
            <Toggle
              checked={aiEnabled}
              onCheckedChange={checked => isProductOwner && editMode && setAiEnabled(!!checked)}
              disabled={!isProductOwner || !editMode}
              id="ai-enabled"
            />
            <label htmlFor="ai-enabled" className="text-base font-medium">
              Enable AI Suggestions
            </label>
          </div>
          {/* AI Context Container */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">AI Context</label>
            {editMode ? (
              <textarea
                value={aiContext}
                onChange={e => setAiContext(e.target.value)}
                className="input border border-gray-300 focus:border-[#ac1754] rounded px-3 py-2 w-full"
                placeholder="AI Context (e.g., preferred tone, language, or specific project focus)"
                rows={3}
                style={{ maxHeight: 120, minHeight: 48 }}
              />
            ) : (
              <div className="text-base text-muted-foreground whitespace-pre-line min-h-[48px] max-h-[120px] overflow-y-auto border rounded px-3 py-2 bg-[var(--neutral-100)]">
                {aiContext || <span className="italic text-gray-400">No context set.</span>}
              </div>
            )}
          </div>
          {/* Tech Stack for AI Container */}
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack for AI</label>
            {editMode ? (
              <textarea
                value={aiTechStack}
                onChange={e => setAiTechStack(e.target.value)}
                className="input border border-gray-300 focus:border-[#ac1754] rounded px-3 py-2 w-full"
                placeholder="e.g., OpenAI GPT-4, LangChain, Pinecone, Next.js, etc."
                rows={2}
                style={{ maxHeight: 80, minHeight: 32 }}
              />
            ) : (
              <div className="text-base text-muted-foreground whitespace-pre-line min-h-[32px] max-h-[80px] overflow-y-auto border rounded px-3 py-2 bg-[var(--neutral-100)]">
                {aiTechStack || <span className="italic text-gray-400">No tech stack set.</span>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISettingsView;