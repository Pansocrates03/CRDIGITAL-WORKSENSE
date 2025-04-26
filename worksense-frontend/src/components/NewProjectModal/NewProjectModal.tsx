// Importo React y varios hooks útiles para manejar estado, refs y efectos
import React, { useState, useRef, useEffect, useMemo } from "react";

// Estilos y componentes personalizados
import styles from "./NewProjectModal.module.css";
import MemberSelection from "./MemberSelection";
import InputWithClear from "./InputWithClear";
import BacklogProgress from "./BacklogProgress";
import useAutoResizeTextarea from "../../hooks/resizingTextarea";
import apiClient from "../../api/apiClient";
import { Alert } from "../../components/Alert/Alert";

// Tipos para props y estado
import {
  User,
  ProjectMember,
  FormErrors,
  NewProjectModalProps,
} from "../../types";

// Componente principal del modal para crear proyecto
const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProjectName = "",
  initialDescription = "",
  title = "New Project",
  submitButtonText = "Start",
  currentUserId,
}) => {
  // Estado para inputs del formulario
  const [projectName, setProjectName] = useState(initialProjectName);
  const [shouldPopulateBacklog, setShouldPopulateBacklog] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<ProjectMember[]>([]);

  // Alertas para errores o éxito
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // Hook personalizado para el textarea que se autoajusta
  const {
    value: description,
    setValue: setDescription,
    handleChange: handleTextareaChange,
    clear: handleClearDescription,
    textareaRef,
  } = useAutoResizeTextarea(initialDescription);

  // Lista de usuarios y estado de carga
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Errores del formulario y estado de envío
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Estado para el llenado automático del backlog
  const [isPopulatingBacklog, setIsPopulatingBacklog] = useState(false);
  const [populationProgress, setPopulationProgress] = useState(0);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Referencias para el modal y el input
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lista filtrada de usuarios disponibles (excluyendo al actual y ya seleccionados)
  const availableUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.id !== currentUserId &&
        !selectedMembers.some((member) => member.userId === user.id)
    );
  }, [users, selectedMembers, currentUserId]);

  // Función para obtener usuarios desde la API
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await apiClient.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Lógica para generar backlog automáticamente usando IA
  const populateBacklog = async (projectId: string): Promise<void> => {
    setIsPopulatingBacklog(true);
    setPopulationProgress(0);

    try {
      await apiClient.post(`/projects/${projectId}/generate-epic`);
      setPopulationProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500)); // pequeña pausa para UX
    } catch (error) {
      console.error("Error generando backlog:", error);
      setErrors({
        ...errors,
        members: "Error al generar el backlog. Intenta de nuevo.",
      });
    } finally {
      setIsPopulatingBacklog(false);
    }
  };

  // Validación del formulario antes de enviar
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!projectName.trim()) newErrors.projectName = "El nombre es obligatorio";
    if (!description.trim())
      newErrors.description = "La descripción es obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers para inputs y miembros
  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
    if (errors.projectName) {
      setErrors({ ...errors, projectName: undefined });
    }
  };

  const handleClearProjectName = () => {
    setProjectName("");
    inputRef.current?.focus();
  };

  const handleAddMember = (member: ProjectMember) => {
    if (!selectedMembers.some((m) => m.userId === member.userId)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleRemoveMember = (userId: number) => {
    setSelectedMembers(selectedMembers.filter((m) => m.userId !== userId));
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsCreatingProject(true);
      try {
        const projectId = await onSubmit(
          projectName.trim(),
          description.trim(),
          selectedMembers,
          shouldPopulateBacklog
        );

        setCreatedProjectId(projectId);
        if (shouldPopulateBacklog) await populateBacklog(projectId);

        setAlert({
          type: "success",
          title: "¡Proyecto creado!",
          message: "Tu proyecto está listo para usarse.",
        });

        onClose();
      } catch (error) {
        console.error("Error creando proyecto:", error);
        setErrors({ ...errors, members: "Error al crear proyecto." });
      } finally {
        setIsCreatingProject(false);
      }
    }
  };

  // useEffects para manejar lógica cuando el modal abre o cambia algo
  useEffect(() => {
    if (isOpen) fetchUsers();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setProjectName(initialProjectName);
      setDescription(initialDescription);
      setSelectedMembers([]);
      setErrors({});
      setIsPopulatingBacklog(false);
      setPopulationProgress(0);
      setCreatedProjectId(null);
      setAlert(null);

      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialProjectName, initialDescription]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPopulatingBacklog) {
      interval = setInterval(() => {
        setPopulationProgress((prev) => {
          const increment = prev < 70 ? 5 : prev < 90 ? 2 : 1;
          return Math.min(prev + increment, 95);
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPopulatingBacklog]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null; // Si no está abierto, no renderizo nada

  return (
    <>
      {/* Contenedor del modal */}
      <div className={styles.modalOverlay} role="dialog" aria-modal="true">
        <div className={styles.modalContent} ref={modalRef}>
          {isPopulatingBacklog ? (
            <BacklogProgress progress={populationProgress} />
          ) : (
            <>
              {/* Encabezado y descripción del modal */}
              <div className={styles.modalHeader}>
                <h2>{title}</h2>
                <p className={styles.modalDescription}>
                  Tu proyecto tendrá su propio espacio independiente.
                </p>
              </div>

              {/* Formulario principal */}
              <form onSubmit={handleSubmit}>
                <InputWithClear
                  id="projectName"
                  value={projectName}
                  onChange={handleProjectNameChange}
                  onClear={handleClearProjectName}
                  placeholder="Nombre del proyecto"
                  label="Nombre"
                  error={errors.projectName}
                  inputRef={inputRef}
                  required={true}
                />

                {/* Textarea de descripción con opción de limpiar */}
                <div className={styles.formGroup}>
                  <label htmlFor="description">Descripción</label>
                  <div className={styles.textareaWrapper}>
                    <textarea
                      id="description"
                      ref={textareaRef}
                      value={description}
                      onChange={handleTextareaChange}
                      placeholder="Describe tu proyecto"
                      rows={3}
                      className={styles.textarea}
                      aria-required="true"
                      aria-invalid={!!errors.description}
                    />
                    {description && (
                      <button
                        type="button"
                        className={styles.clearButton}
                        onClick={handleClearDescription}
                        aria-label="Limpiar descripción"
                      >
                        <span aria-hidden="true">✕</span>
                      </button>
                    )}
                  </div>
                  {errors.description && (
                    <p className={styles.errorMessage}>{errors.description}</p>
                  )}
                </div>

                {/* Componente para seleccionar miembros */}
                <MemberSelection
                  users={users}
                  selectedMembers={selectedMembers}
                  onAddMember={handleAddMember}
                  onRemoveMember={handleRemoveMember}
                  isLoading={isLoadingUsers}
                  error={errors.members}
                  availableUsers={availableUsers}
                />

                {/* Checkbox para usar IA */}
                <div className={styles.formGroup}>
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      id="populateBacklog"
                      checked={shouldPopulateBacklog}
                      onChange={(e) =>
                        setShouldPopulateBacklog(e.target.checked)
                      }
                    />
                    <label
                      htmlFor="populateBacklog"
                      className={styles.checkboxLabel}
                    >
                      Generar backlog automáticamente con IA
                      <span className={styles.aiLabel}>AI</span>
                    </label>
                  </div>
                  {shouldPopulateBacklog && (
                    <p className={styles.aiDescription}>
                      Analizaremos la descripción para generar épicas e
                      historias.
                    </p>
                  )}
                </div>

                {/* Botones del modal */}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                    disabled={isCreatingProject || isPopulatingBacklog}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={styles.startButton}
                    disabled={
                      !projectName.trim() ||
                      !description.trim() ||
                      isCreatingProject ||
                      isPopulatingBacklog
                    }
                  >
                    {isCreatingProject ? "Creando..." : submitButtonText}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Alerta de éxito o error */}
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </>
  );
};

export default NewProjectModal;
