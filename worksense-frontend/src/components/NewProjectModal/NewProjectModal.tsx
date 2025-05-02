// Importo React y varios hooks útiles para manejar estado, refs y efectos
import React, { useState, useRef, useEffect } from "react";

// Estilos y componentes personalizados
import styles from "./NewProjectModal.module.css";
import BacklogProgress from "./BacklogProgress";
import { Alert } from "../../components/Alert/Alert";
import Form from "./Form";

type NewProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialProjectName?: string;
  initialDescription?: string;
  title?: string;
  submitButtonText?: string;
  currentUserId: number;
}

// Componente principal del modal para crear proyecto
const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  title = "New Project",
  currentUserId,
}) => {
  
  // Alertas para errores o éxito
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);


  // Estado para el llenado automático del backlog
  const [isPopulatingBacklog, setIsPopulatingBacklog] = useState(false);
  const [populationProgress, setPopulationProgress] = useState(0);

  // Referencias para el modal y el input
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  // useEffects para manejar lógica cuando el modal abre o cambia algo
  useEffect(() => {
    if (isOpen) {
      setIsPopulatingBacklog(false);
      setPopulationProgress(0);
      setAlert(null);

      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  // Contenido del modal
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
                  Your project will have its own independent space.
                </p>
              </div>

              {/* Formulario principal */}
              <Form
                currentUserId={currentUserId}
                onClose={onClose} />
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