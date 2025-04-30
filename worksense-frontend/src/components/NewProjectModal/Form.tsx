import React, { useState, useRef, useMemo } from "react";
import InputWithClear from "./InputWithClear";
import MemberSelection from "./MemberSelection";
import Member from "@/types/MemberType";
import { projectService } from "@/services/projectService";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import styles from "./NewProjectModal.module.css";
import { User } from "@/types/UserType";
import apiClient from "../../api/apiClient";  

type localFormError = {
  projectName?: string;
  description?: string;
  members?: string;
}

const Form: React.FC<{currentUserId: number, onClose: () => void}> = ({ currentUserId, onClose }) => {
    const queryClient = useQueryClient();

    // Estado para inputs del formulario
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [shouldPopulateBacklog, setShouldPopulateBacklog] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    

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

    let isPopulatingBacklog = false;



    ///////////////
    // FUNCIONES //
    ///////////////



      // Validación del formulario antes de enviar
    const validateForm = (): boolean => {
        const newErrors: localFormError = {};
        if (!projectName.trim()) newErrors.projectName = "El nombre es obligatorio";
        if (!description.trim())
        newErrors.description = "La descripción es obligatoria";
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
        if(!validateForm()) return; // Validar antes de continuar (corregido: añadido paréntesis)
        setIsCreatingProject(true);
        setErrors({}); // Limpiar errores previos

        try {
            await projectService.createProejct({
                name: projectName,
                description: description,
                context: {},
                members: selectedMembers,
            });

            setAlert({
                type: "success",
                title: "Proyecto creado con éxito",
                message: `El proyecto "${projectName}" ha sido creado.`,
            });

            // Invalidamos el query de proyectos del usuario para refrescar la lista
            queryClient.invalidateQueries({ queryKey: ["userProjects"] });
        } catch (error) {
            console.error("Error al crear proyecto:", error);
            setAlert({
            type: "error",
            title: "Error al crear proyecto",
            message: "Ocurrió un error al crear el proyecto. Intenta de nuevo.",
            });
        } finally {
            setIsCreatingProject(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
                <InputWithClear
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onClear={() => setProjectName("")}
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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
                        onClick={() => setDescription("")}
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
                      onChange={(e) => setShouldPopulateBacklog(e.target.checked) }
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
                  >Cancelar</button>

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
                    {isCreatingProject ? "Creando..." : "Crear Proyecto"}
                  </button>
                </div>
              </form>
    );
}

export default Form;