import React from "react";
import CreateItemForm from "./CreateItemForm";
import CreateSubItemForm from "./CreateSubItemForm";

interface BacklogModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  parentItemId: string | null;
  onSuccess?: () => void;
}

const BacklogModal: React.FC<BacklogModalProps> = ({
  isOpen,
  onClose,
  projectId,
  parentItemId,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... código existente ...
    try {
      // ... código existente ...
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // ... código existente ...
    }
  };

  const handleClose = () => {
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        {parentItemId ? (
          <CreateSubItemForm
            projectId={projectId}
            parentItemId={parentItemId}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        ) : (
          <CreateItemForm
            projectId={projectId}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default BacklogModal;
