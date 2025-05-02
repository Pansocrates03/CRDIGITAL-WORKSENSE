// src/components/BacklogTable/GenerateStoriesModal.tsx
import React, { FC, useState, useEffect } from "react";
import { X, Save, Trash2, RefreshCw, Sparkles } from "lucide-react";
import styles from "./CreateItemModal.module.css"; // Reutilizamos los estilos existentes
import aiStoriesService from "@/services/aiStoriesService";
import { AiStorySuggestion } from "@/types/ai";
import { BacklogItemType } from "@/types/BacklogItemType";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

interface GenerateStoriesModalProps {
  projectId: string;
  epicId: string;
  epicName: string;
  isOpen: boolean;
  onClose: () => void;
  onStoriesAdded: () => void;
  onError?: (message: string) => void;
}

const GenerateStoriesModal: FC<GenerateStoriesModalProps> = ({
  projectId,
  epicId,
  epicName,
  isOpen,
  onClose,
  onStoriesAdded,
  onError,
}) => {
  const [suggestedStories, setSuggestedStories] = useState<AiStorySuggestion[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Cuando se abre el modal, generamos sugerencias automáticamente
  useEffect(() => {
    if (isOpen && epicId) {
      generateSuggestions();
    } else if (!isOpen) {
      // Limpiar estado al cerrar
      setSuggestedStories([]);
      setError(null);
      setHasChanges(false);
    }
  }, [isOpen, epicId]);

  // Función para manejar el cierre con confirmación
  const handleCloseWithConfirmation = () => {
    // Si hay historias generadas y no se ha guardado, mostrar advertencia
    if (suggestedStories.length > 0 && hasChanges) {
      setShowWarningModal(true);
    } else {
      // Si no hay cambios, cerrar directamente
      handleConfirmedClose();
    }
  };

  // Función para cerrar después de confirmar
  const handleConfirmedClose = () => {
    // Limpiar la caché para esta épica
    aiStoriesService.clearCache(epicId);

    // Cerrar el modal
    onClose();
  };

  // Función para generar sugerencias de historias
  const generateSuggestions = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const stories = await aiStoriesService.generateStories(projectId, epicId);
      setSuggestedStories(stories);
      setHasChanges(true); // Marcar que hay cambios
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to generate story suggestions";
      console.error("Error generating stories:", err);
      setError(msg);
      onError?.(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para actualizar una historia sugerida
  const updateStory = (
    index: number,
    field: keyof AiStorySuggestion,
    value: string | string[] | null
  ) => {
    const updatedStories = [...suggestedStories];
    updatedStories[index] = {
      ...updatedStories[index],
      [field]: value,
    };
    setSuggestedStories(updatedStories);
    setHasChanges(true); // Marcar que hay cambios
  };

  // Función para eliminar una historia sugerida
  const removeStory = (index: number) => {
    setSuggestedStories((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true); // Marcar que hay cambios
  };

  // Función para guardar las historias seleccionadas
  const handleSave = async () => {
    if (suggestedStories.length === 0) {
      setError("No stories to add");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Aseguramos que las historias están asociadas a la épica correcta
      await aiStoriesService.confirmStories(
        projectId,
        epicId,
        suggestedStories
      );

      onStoriesAdded();
      setHasChanges(false); // Resetear el estado de cambios
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to add stories to backlog";
      console.error("Error adding stories:", err);
      setError(msg);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={styles.modalOverlay}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>AI Suggested Stories for "{epicName}"</h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
              disabled={isLoading}
            >
              <X size={18} />
            </button>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Review, edit, or remove the suggested user stories below before
              adding them to this epic.
            </p>

            <button
              onClick={generateSuggestions}
              disabled={isGenerating}
              className="flex items-center justify-center gap-1 text-sm bg-pink-50 text-pink-700 px-3 py-1 rounded-md hover:bg-pink-100 transition-colors"
              style={{
                color: "#ac1754",
                backgroundColor: "rgba(172, 23, 84, 0.1)",
              }}
            >
              <Sparkles size={16} />
              {isGenerating ? "Generating..." : "Regenerate Suggestions"}
            </button>
          </div>

          {isGenerating ? (
            <div className="flex justify-center py-8">
              <div
                className="animate-spin h-8 w-8 border-4 rounded-full border-t-transparent"
                style={{
                  borderColor: "#ac1754",
                  borderTopColor: "transparent",
                }}
              ></div>
            </div>
          ) : (
            <div>
              {suggestedStories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No story suggestions available. Try generating again.
                </div>
              ) : (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto p-2">
                  {suggestedStories.map((story, index) => (
                    <div
                      key={index}
                      className="border rounded-md p-4 bg-gray-50 relative"
                    >
                      <button
                        onClick={() => removeStory(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className={styles.formGroup}>
                        <label htmlFor={`name-${index}`}>Name*</label>
                        <input
                          id={`name-${index}`}
                          type="text"
                          value={story.name}
                          onChange={(e) =>
                            updateStory(index, "name", e.target.value)
                          }
                          required
                          placeholder="Story name"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor={`description-${index}`}>
                          Description
                        </label>
                        <textarea
                          id={`description-${index}`}
                          value={story.description || ""}
                          onChange={(e) =>
                            updateStory(index, "description", e.target.value)
                          }
                          rows={3}
                          placeholder="Story description"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor={`acceptanceCriteria-${index}`}>
                          Acceptance Criteria (one per line)
                        </label>
                        <textarea
                          id={`acceptanceCriteria-${index}`}
                          value={story.acceptanceCriteria?.join("\n") || ""}
                          onChange={(e) => {
                            const lines = e.target.value
                              .split("\n")
                              .filter((line) => line.trim());
                            updateStory(index, "acceptanceCriteria", lines);
                          }}
                          rows={3}
                          placeholder="Enter acceptance criteria"
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.priority}`}>
                        <label htmlFor={`priority-${index}`}>Priority</label>
                        <select
                          id={`priority-${index}`}
                          value={story.priority}
                          onChange={(e) =>
                            updateStory(
                              index,
                              "priority",
                              e.target.value as "low" | "medium" | "high"
                            )
                          }
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div className={`${styles.formGroup} ${styles.epic}`}>
                        <label htmlFor={`size-${index}`}>Epic</label>
                        <select
                          id={`size-${index}`}
                          value={story.size || ""}
                          onChange={(e) =>
                            updateStory(index, "size", e.target.value)
                          }
                        >
                          <option value="">Select Size</option>
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCloseWithConfirmation}
              disabled={isLoading || isGenerating}
            >
              <X size={16} className="mr-1" /> Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={styles.submitButton}
              disabled={
                isLoading || isGenerating || suggestedStories.length === 0
              }
            >
              {isLoading ? (
                "Adding Stories..."
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  Add to Epic
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para cerrar sin guardar */}
      <DeleteConfirmationModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        onConfirm={handleConfirmedClose}
        title="Discard Generated Stories"
        message="You have unsaved story suggestions. If you close now, these suggestions will be lost and the cache will be cleared. Are you sure you want to continue?"
      />
    </>
  );
};

export default GenerateStoriesModal;
