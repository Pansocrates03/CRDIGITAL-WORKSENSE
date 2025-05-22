import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService"; 
import { useAuth } from "@/hooks/useAuth"; 
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "On-hold", label: "On Hold" },
  { value: "Completed", label: "Completed" },
];

const visibilityOptions = [
  { value: "Private", label: "Private" },
  { value: "Team", label: "Team" },
  { value: "Public", label: "Public" },
];

const GeneralInfoView: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch project data
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.fetchProjectDetails(projectId!),
    enabled: !!projectId,
  });

  // Local state for edit mode
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // When project data loads, set form state (with fallback for missing fields)
  React.useEffect(() => {
    if (project) setForm({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "Active",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      visibility: project.visibility || "",
    });
  }, [project]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save changes
  const mutation = useMutation({
    mutationFn: (updated: any) => projectService.updateProject(projectId!, updated),
    onSuccess: () => {
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      console.log("TOAST: Project updated successfully!");
      toast.success("Project updated successfully!");
    },
    onError: () => {
      setEditMode(false);
      toast.error("There was an error updating the project");
    },
  });

  const handleSave = () => {
    mutation.mutate(form);
  };

  // Delete project
  const deleteMutation = useMutation({
    mutationFn: () => projectService.deleteProject(projectId!),
    onSuccess: () => {
      toast.success("Project successfully deleted");
      navigate("/create", { state: { toast: "Project successfully deleted" } });
    },
    onError: () => {
      setShowDeleteModal(false);
      setDeleteInput("");
      toast.error("There was an error deleting the project");
    },
  });

  if (isLoading || !form || !user || !project) return <div>Loading...</div>;

  // Now both user and project are defined!
  const isProductOwner =
    project.ownerId == user.userId ||
    (Array.isArray(project.members) &&
      project.members.some(
        member =>
          String(member.userId) === String(user.userId) &&
          member.projectRoleId === "product-owner"
      ));

  return (
    <div className="general-info-view">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground">General Info</h3>
            <p className="text-muted-foreground mt-1">
              Basic information about your project.
            </p>
          </div>
          {isProductOwner && !editMode && (
            <Button
              onClick={() => setEditMode(true)}
            >
              Edit
            </Button>
          )}
          {isProductOwner && editMode && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditMode(false);
                  setForm({
                    name: project?.name || "",
                    description: project?.description || "",
                    status: project?.status || "Active",
                    startDate: project?.startDate || "",
                    endDate: project?.endDate || "",
                    visibility: project?.visibility || "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            {editMode ? (
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input border border-gray-300 focus:border-[#ac1754] rounded px-3 py-2 w-full"
              />
            ) : (
              <div className="text-lg">{form.name}</div>
            )}
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            {editMode ? (
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input border border-gray-300 focus:border-[#ac1754] rounded px-3 py-2 w-full"
              />
            ) : (
              <div className="text-base">{form.description}</div>
            )}
          </div>
          {/* Inline Fields Container */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4">
            {/* Start Date */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              {editMode ? (
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate?.slice(0, 10)}
                  onChange={handleChange}
                  className="input border border-gray-300 focus:border-[#ac1754] rounded px-3 py-2 w-full"
                />
              ) : (
                <div>{form.startDate ? form.startDate.slice(0, 10) : "Not set"}</div>
              )}
            </div>
            {/* End Date */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              {editMode ? (
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate?.slice(0, 10)}
                  onChange={handleChange}
                  className="input border border-gray-300 focus:border-[#ac1754] rounded px-3 py-2 w-full"
                />
              ) : (
                <div>{form.endDate ? form.endDate.slice(0, 10) : "Not set"}</div>
              )}
            </div>
            {/* Status */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              {editMode ? (
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="input border border-gray-300 focus:border-[#ac1754] rounded px-3 py-2 w-full"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <div>{form.status}</div>
              )}
            </div>
            {/* Visibility */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700">Visibility</label>
              {editMode ? (
                <select
                  name="visibility"
                  value={form.visibility}
                  onChange={handleChange}
                  className="input border border-gray-300 focus:border-[#ac1754] rounded px-3 py-2 w-full"
                >
                  <option value="">Not set</option>
                  {visibilityOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <div>{form.visibility || "Not set"}</div>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-10 border-t pt-6">
          <h4 className="text-lg font-bold mb-2">Danger Zone</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting this project is irreversible. All data will be lost.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
            disabled={!isProductOwner}
          >
            Delete Project
          </Button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md shadow-lg border z-10">
          <h2 className="text-xl font-bold mb-2">Delete Project</h2>
          <p className="mb-4">
            This action <span className="font-bold text-[#ac1754]">cannot be undone</span>.<br />
            To confirm, type <span className="font-mono bg-gray-100 px-1">{form.name}</span> below:
          </p>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded mb-4"
            value={deleteInput}
            onChange={e => setDeleteInput(e.target.value)}
            placeholder={`Type "${form.name}" to confirm`}
          />
          <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteInput("");
              }}
            >
              Cancel
              </Button>
              <Button
                variant="destructive"
              disabled={deleteInput !== form.name}
              onClick={() => {
                deleteMutation.mutate();
                setShowDeleteModal(false);
                setDeleteInput("");
              }}
            >
              Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralInfoView;