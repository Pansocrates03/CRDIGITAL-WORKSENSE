import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/api/apiClient";
import { XIcon, CheckSquare, Bug, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { projectService } from "@/services/projectService";
import { authService } from "@/services/auth";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateSubItemFormProps {
  projectId: string;
  parentItemId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type SubItemType = "task" | "bug" | "story";

interface SubItemTypeOption {
  value: SubItemType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const subItemTypes: SubItemTypeOption[] = [
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
  {
    value: "story",
    label: "Story",
    icon: <BookOpen className="h-5 w-5" />,
    description: "A user story or functional requirement",
  },
];

const CreateSubItemForm: React.FC<CreateSubItemFormProps> = ({
  projectId,
  parentItemId,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    projectID: projectId,
    parentItemID: parentItemId,
    name: "",
    description: "",
    tag: "" as SubItemType,
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

  const handleTypeSelect = (type: SubItemType) => {
    setFormData({ ...formData, tag: type });
  };

  const handleAssigneeChange = (userId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        asignee: [...formData.asignee, userId],
      });
    } else {
      setFormData({
        ...formData,
        asignee: formData.asignee.filter((id) => id !== userId),
      });
    }
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

      const response = await apiClient.post("/items/subitem", formData);
      console.log("Subitem created:", response.data);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error creating the subitem:", error);
      setError(
        error.response?.data?.error ||
          "Error creating the subitem. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Create Subitem</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div className="space-y-2">
          <Label>Type *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {subItemTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeSelect(type.value)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                  formData.tag === type.value
                    ? "border-[#ac1754] bg-[#ac1754]/10"
                    : "border-input hover:border-[#ac1754]"
                )}
              >
                {type.icon}
                <span>{type.label}</span>
              </button>
            ))}
          </div>
          {subItemTypes.map(
            (type) =>
              formData.tag === type.value && (
                <p
                  key={type.value}
                  className="text-sm text-muted-foreground mt-1"
                >
                  {type.description}
                </p>
              )
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Title *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name of the subitem"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Author of the subitem"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description of the subitem"
            className="w-full min-h-[100px] p-2 rounded-md border border-input bg-transparent"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="asignee">Assignees</Label>
          <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
            {isLoadingMembers ? (
              <div className="text-sm text-muted-foreground">
                Loading members...
              </div>
            ) : members.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No members available
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`member-${member.userId}`}
                    checked={formData.asignee.includes(
                      member.userId.toString()
                    )}
                    onCheckedChange={(checked) =>
                      handleAssigneeChange(
                        member.userId.toString(),
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    htmlFor={`member-${member.userId}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {member.fullName || member.name || `User ${member.userId}`}
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="acceptanceCriteria">Acceptance Criteria</Label>
          <textarea
            id="acceptanceCriteria"
            name="acceptanceCriteria"
            value={formData.acceptanceCriteria.join("\n")}
            onChange={(e) =>
              setFormData({
                ...formData,
                acceptanceCriteria: e.target.value
                  .split("\n")
                  .filter((line) => line.trim()),
              })
            }
            placeholder="Enter acceptance criteria (one per line)"
            className="w-full min-h-[100px] p-2 rounded-md border border-input bg-transparent"
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
              <option value="To do">To do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
              <option value="Blocked">Blocked</option>
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

        {error && (
          <div className="text-red-500 text-sm" role="alert">
            {error}
          </div>
        )}

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
            {isSubmitting ? "Creating..." : "Create Subitem"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSubItemForm;
