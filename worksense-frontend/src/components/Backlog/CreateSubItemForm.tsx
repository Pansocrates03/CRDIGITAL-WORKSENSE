import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/api/apiClient";
import { XIcon, CheckSquare, Bug, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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
    author: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validar campos requeridos
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
    <div className="bg-card p-6 rounded-lg shadow-md w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create New Subitem</h2>
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
        {/* Tipo de SubItem */}
        <div className="space-y-2">
          <Label>Subitem Type *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subItemTypes.map((type) => (
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
