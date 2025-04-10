import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/api/apiClient";
import { XIcon, FileText, Layers, CheckSquare, Bug } from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";
import { projectService } from "@/services/projectService";

interface CreateItemFormProps {
  projectId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type ItemType = "epic" | "story" | "task" | "bug";

interface ItemTypeOption {
  value: ItemType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const itemTypes: ItemTypeOption[] = [
  {
    value: "epic",
    label: "Epic",
    icon: <Layers className="h-5 w-5" />,
    description: "A big initiative that can be divided into stories",
  },
  {
    value: "story",
    label: "Story",
    icon: <FileText className="h-5 w-5" />,
    description: "A feature from the user's perspective",
  },
  {
    value: "task",
    label: "Task",
    icon: <CheckSquare className="h-5 w-5" />,
    description: "A specific technical work unit",
  },
  {
    value: "bug",
    label: "Bug",
    icon: <Bug className="h-5 w-5" />,
    description: "A problem or error that needs to be fixed",
  },
];

const CreateItemForm: React.FC<CreateItemFormProps> = ({
  projectId,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    projectID: projectId,
    name: "",
    description: "",
    tag: "" as ItemType,
    status: "To do",
    priority: "medium",
    size: 0,
    author: authService.getCurrentUser()?.fullName || "",
    asignee: [] as string[],
    acceptanceCriteria: [] as string[],
  });

  const [members, setMembers] = useState<
    Array<{ userId: number; name?: string; fullName?: string }>
  >([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoadingMembers(true);
      try {
        const projectMembers = await projectService.getProjectMembers(
          projectId
        );
        setMembers(projectMembers);
      } catch (error) {
        console.error("Error fetching members:", error);
        setError("Error loading project members");
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTypeSelect = (type: ItemType) => {
    setFormData({ ...formData, tag: type });
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData({ ...formData, asignee: selectedOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.tag) {
        setError("The name, description and type are required fields");
        setIsSubmitting(false);
        return;
      }

      const response = await apiClient.post("/items", formData);
      console.log("Item created:", response.data);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error creating the item:", error);
      setError(
        error.response?.data?.error ||
          "Error creating the item. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create New Item</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Item */}
        <div className="space-y-2">
          <Label>Item Type *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {itemTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border transition-colors",
                  "hover:bg-muted/50",
                  formData.tag === type.value
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
                onClick={() => handleTypeSelect(type.value)}
              >
                <div className="mt-0.5">{type.icon}</div>
                <div className="text-left">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {type.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Title *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name of the item"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="asignee">Assignees</Label>
            <select
              id="asignee"
              name="asignee"
              multiple
              value={formData.asignee}
              onChange={handleAssigneeChange}
              className="w-full min-h-[100px] p-2 rounded-md border border-input bg-transparent"
              disabled={isLoadingMembers}
            >
              {members.map((member) => (
                <option key={member.userId} value={member.userId.toString()}>
                  {member.fullName || member.name || `User ${member.userId}`}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">
              Hold Ctrl/Cmd to select multiple members
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description of the item"
            className="w-full min-h-[100px] p-2 rounded-md border border-input bg-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1"
            >
              <option value={"To Do"}>To Do</option>
              <option value={"In Progress"}>In Progress</option>
              <option value={"Done"}>Done</option>
              <option value={"Blocked"}>Blocked</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1"
            >
              <option value="lowest">Lowest</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="highest">Highest</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              name="size"
              type="number"
              value={formData.size}
              onChange={handleChange}
              min="0"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#ac1754] hover:bg-[#8e0e3d]"
            disabled={isSubmitting || !formData.tag}
          >
            {isSubmitting ? "Creating..." : "Create Item"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateItemForm;
