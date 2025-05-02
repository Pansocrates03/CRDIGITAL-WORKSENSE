// src/components/BacklogTable/GenerateEpicsModal.tsx
import React, { FC, useState, useEffect } from "react";
import { X, Save, Trash2, Sparkles } from "lucide-react";
import styles from "./CreateItemModal.module.css"; // Reutilizamos los estilos existentes
import aiEpicsService from "@/services/aiEpicsServices";
import { AiEpicSuggestion } from "@/types/ai";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

interface GenerateEpicsModalProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  onEpicsAdded: () => void;
  onError?: (message: string) => void;
}

const GenerateEpicsModal: FC<GenerateEpicsModalProps> = ({
  projectId,
  projectName,
  isOpen,
  onClose,
  onEpicsAdded,
  onError,
}) => {
  const [suggestedEpics, setSuggestedEpics] = useState<AiEpicSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Cuando se abre el modal, generamos sugerencias automáticamente
  useEffect(() => {
    if (isOpen && projectId) {
      generateSuggestions();
    } else if (!isOpen) {
      // Limpiar estado al cerrar
      setSuggestedEpics([]);
      setError(null);
      setHasChanges(false);
    }
  }, [isOpen, projectId]);

  // Función para manejar el cierre con confirmación
  const handleCloseWithConfirmation = () => {
    // Si hay épicas generadas y no se ha guardado, mostrar advertencia
    if (suggestedEpics.length > 0 && hasChanges) {
      setShowWarningModal(true);
    } else {
      // Si no hay cambios, cerrar directamente
      handleConfirmedClose();
    }
  };

  // Función para cerrar después de confirmar
  const handleConfirmedClose = () => {
    // Limpiar la caché para este proyecto
    aiEpicsService.clearCache(projectId);

    // Cerrar el modal
    onClose();
  };

  // Función para generar sugerencias de épicas
  const generateSuggestions = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const epics = await aiEpicsService.generateEpics(projectId);
      setSuggestedEpics(epics);
      setHasChanges(true); // Marcar que hay cambios
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to generate epic suggestions";
      console.error("Error generating epics:", err);
      setError(msg);
      onError?.(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para actualizar una épica sugerida
  const updateEpic = (
    index: number,
    field: keyof AiEpicSuggestion,
    value: string | null | "lowest" | "low" | "medium" | "high" | "highest"
  ) => {
    const updatedEpics = [...suggestedEpics];
    updatedEpics[index] = {
      ...updatedEpics[index],
      [field]: value,
    };
    setSuggestedEpics(updatedEpics);
    setHasChanges(true); // Marcar que hay cambios
  };

  // Función para eliminar una épica sugerida
  const removeEpic = (index: number) => {
    setSuggestedEpics((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true); // Marcar que hay cambios
  };

  // Función para guardar las épicas seleccionadas
  const handleSave = async () => {
    if (suggestedEpics.length === 0) {
      setError("No epics to add");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await aiEpicsService.confirmEpics(projectId, suggestedEpics);

      onEpicsAdded();
      setHasChanges(false); // Resetear el estado de cambios
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to add epics to backlog";
      console.error("Error adding epics:", err);
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
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseWithConfirmation();
          }
        }}
      >
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>AI Suggested Epics for "{projectName}"</h2>
            <button
              className={styles.closeButton}
              onClick={handleCloseWithConfirmation}
              aria-label="Close"
              disabled={isLoading}
            >
              <X size={18} />
            </button>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Review, edit, or remove the suggested epics below before adding them to your project backlog.
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
              {suggestedEpics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No epic suggestions available. Try generating again.
                </div>
              ) : (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto p-2">
                  {suggestedEpics.map((epic, index) => (
                    <div
                      key={index}
                      className="border rounded-md p-4 bg-gray-50 relative"
                    >
                      <button
                        onClick={() => removeEpic(index)}
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
                          value={epic.name}
                          onChange={(e) =>
                            updateEpic(index, "name", e.target.value)
                          }
                          required
                          placeholder="Epic name"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor={`description-${index}`}>
                          Description
                        </label>
                        <textarea
                          id={`description-${index}`}
                          value={epic.description || ""}
                          onChange={(e) =>
                            updateEpic(index, "description", e.target.value)
                          }
                          rows={3}
                          placeholder="Epic description"
                        />
                      </div>

                      <div className={`${styles.formGroup} ${styles.priority}`}>
                        <label htmlFor={`priority-${index}`}>Priority</label>
                        <select
                          id={`priority-${index}`}
                          value={epic.priority}
                          onChange={(e) =>
                            updateEpic(
                              index,
                              "priority",
                              e.target.value as "lowest" | "low" | "medium" | "high" | "highest"
                            )
                          }
                        >
                          <option value="lowest">Lowest</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="highest">Highest</option>
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
                isLoading || isGenerating || suggestedEpics.length === 0
              }
            >
              {isLoading ? (
                "Adding Epics..."
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  Add to Backlog
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
        title="Discard Generated Epics"
        message="You have unsaved epic suggestions. If you close now, these suggestions will be lost and the cache will be cleared. Are you sure you want to continue?"
      />
    </>
  );
};

export default GenerateEpicsModal;