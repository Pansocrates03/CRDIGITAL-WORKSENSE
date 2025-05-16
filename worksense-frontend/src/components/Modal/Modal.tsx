import React, { useRef } from "react";
import styles from "./Modal.module.css";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: React.ReactNode; // Permite pasar contenido personalizado
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null; // No mostrar si no está abierto

    return (
        <div className={styles.modalOverlay} role="dialog" aria-modal={true}>
            <div className={styles.modalContent} ref={modalRef}>
                <h1>{title}</h1>
                {children}
            </div>
        </div>
    );
};

export default Modal;