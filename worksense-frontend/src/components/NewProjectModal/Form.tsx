import React, { useState, useRef, useMemo, useEffect } from "react";
import InputWithClear from "./InputWithClear";
import MemberSelection from "./MemberSelection";
import Member from "@/types/MemberType";
import { projectService } from "@/services/projectService";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import styles from "./NewProjectModal.module.css";
import { User } from "@/types/UserType";
import apiClient from "../../api/apiClient";
import GenerateEpicsModal from "../BacklogTable/GenerateEpicsModal";
import { Sparkles } from "lucide-react";

type localFormError = {
  projectName?: string;
  description?: string;
  members?: string;
}

const Form: React.FC<{currentUserId: number, onClose: () => void}> = ({ currentUserId, onClose }) => {
    const queryClient = useQueryClient();

    // Variables de estado
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [shouldPopulateBacklog, setShouldPopulateBacklog] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const [showGenerateEpicsModal, setShowGenerateEpicsModal] = useState(false);
    const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
    const [isPopulatingBacklog, setIsPopulatingBacklog] = useState(false);

    // Referencias para el modal y el input
    const inputRef = useRef<HTMLInputElement>(null);

    // Función para obtener usuarios desde la API usando React Query
    const { isLoading: isUsersLoading, data: users = [], isError, error } = useQuery({
        queryKey: ["users"],
        queryFn: async (): Promise<User[]> => {
            const response = await apiClient.get("/users");
            return response.data;
        },
    });

    // Alertas para errores o éxito
    const [alert, setAlert] = useState<{
        type: "success" | "error";
        title: string;
        message: string;
    } | null>(null);
    
    // Errores del formulario y estado de envío
    const [errors, setErrors] = useState<localFormError>({});
    const [isCreatingProject, setIsCreatingProject] = useState(false);

    const availableUsers = useMemo(() => {
    return users.filter(
        (user) =>
        user.userId !== currentUserId &&
        !selectedMembers.some((member) => member.userId === user.userId)
    );
    }, [users, selectedMembers, currentUserId]);

    // Efecto para mostrar el modal de generación de épicas después de crear un proyecto
    useEffect(() => {
        if (createdProjectId && shouldPopulateBacklog) {
            setShowGenerateEpicsModal(true);
        }
    }, [createdProjectId, shouldPopulateBacklog]);

    ///////////////
    // FUNCIONES //
    ///////////////

    // Validación del formulario antes de enviar
    const validateForm = (): boolean => {
        const newErrors: localFormError = {};
        if (!projectName.trim()) newErrors.projectName = "Name is required";
        if (!description.trim())
        newErrors.description = "Description is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddMember = (member: Member) => {
        console.log("Adding member", member);
        setSelectedMembers((prevMembers) => {
          const updatedMembers = [...prevMembers, member];
          console.log("Selected members after adding", updatedMembers);
          return updatedMembers;
        });
    };

    const handleRemoveMember = (userId: number) => {
        setSelectedMembers(selectedMembers.filter((m) => m.userId !== userId));
    };

    // Envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!validateForm()) return;
        setIsCreatingProject(true);
        setErrors({});

        try {
            const response = await projectService.createProejct({
                name: projectName,
                description: description,
                context: {},
                members: selectedMembers,
            });

            // Guardar el ID del proyecto creado para poder generar épicas
            if (response && response.id) {
                setCreatedProjectId(response.id);
            }

            setAlert({
                type: "success",
                title: "Project created successfully",
                message: `The project "${projectName}" has been created.`,
            });

            // Invalidamos el query de proyectos del usuario para refrescar la lista
            queryClient.invalidateQueries({ queryKey: ["userProjects"] });

            // Si no se solicita generar backlog con IA, cerrar el modal
            if (!shouldPopulateBacklog) {
                onClose();
            } else {
                // Si se ha solicitado generar backlog con IA y tenemos el ID del proyecto
                if (response && response.id) {
                    setIsPopulatingBacklog(true);
                    setShowGenerateEpicsModal(true);
                }
            }
        } catch (error) {
            console.error("Error al crear proyecto:", error);
            setAlert({
                type: "error",
                title: "Error creating project",
                message: "An error occurred while creating the project. Please try again.",
            });
        } finally {
            setIsCreatingProject(false);
        }
    };

    // Manejar cuando se completa la generación de épicas
    const handleEpicsAdded = () => {
        setIsPopulatingBacklog(false);
        setShowGenerateEpicsModal(false);
        
        // Actualizar el estado de alerta para informar al usuario
        setAlert({
            type: "success",
            title: "Epics added to backlog",
            message: `Epics have been successfully generated and added to the project backlog.`,
        });

        // Cerrar el modal principal
        onClose();
    };

    // Manejar error en la generación de épicas
    const handleEpicGenerationError = (message: string) => {
        setIsPopulatingBacklog(false);
        setAlert({
            type: "error",
            title: "Error generating epics",
            message: message,
        });
    };
    
    return (
        <>
            <form onSubmit={handleSubmit}>
                <InputWithClear
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onClear={() => setProjectName("")}
                  placeholder="Project name"
                  label="Name"
                  error={errors.projectName}
                  inputRef={inputRef}
                  required={true}
                />

                {/* Textarea de descripción con opción de limpiar */}
                <div className={styles.formGroup}>
                  <label htmlFor="description">Description</label>
                  <div className={styles.textareaWrapper}>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your project"
                      rows={3}
                      className={styles.textarea}
                      aria-required="true"
                      aria-invalid={!!errors.description}
                    />
                    {description && (
                      <button
                        type="button"
                        className={styles.clearButton}
                        onClick={() => setDescription("")}
                        aria-label="Clear description"
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
                  isLoading={isUsersLoading}
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
                      onChange={(e) => setShouldPopulateBacklog(e.target.checked)}
                    />
                    <label
                      htmlFor="populateBacklog"
                      className={styles.checkboxLabel}
                    >
                      Automatically generate backlog with AI
                      <span className={styles.aiLabel}>
                        <Sparkles size={12} className="mr-1" /> AI
                      </span>
                    </label>
                  </div>
                  {shouldPopulateBacklog && (
                    <p className={styles.aiDescription}>
                      We will analyze the description to generate epics and stories for your project backlog.
                    </p>
                  )}
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                    disabled={isCreatingProject || isPopulatingBacklog}
                  >
                    Cancel
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
                    {isCreatingProject ? "Creating..." : shouldPopulateBacklog ? "Create & Generate Backlog" : "Create Project"}
                  </button>
                </div>
            </form>

            {/* Modal para generar épicas con IA */}
            {showGenerateEpicsModal && createdProjectId && (
                <GenerateEpicsModal
                    projectId={createdProjectId}
                    projectName={projectName}
                    isOpen={showGenerateEpicsModal}
                    onClose={() => {
                        setShowGenerateEpicsModal(false);
                        setIsPopulatingBacklog(false);
                        onClose(); // Cerrar el modal principal también
                    }}
                    onEpicsAdded={handleEpicsAdded}
                    onError={handleEpicGenerationError}
                />
            )}
        </>
    );
}

export default Form;
