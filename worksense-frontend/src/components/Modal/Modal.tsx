import React, { useRef } from "react";
import styles from "./Modal.module.css";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    size: "sm" | "m" | "l";
    children?: React.ReactNode; // Permite pasar contenido personalizado
};

const sizeClassMap: Record<ModalProps["size"], string> = {
    sm: styles.modalContentSm,
    m: styles.modalContentM,
    l: styles.modalContentL,
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, size = "sm", children }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null; // No mostrar si no está abierto

    return (
        <div className={styles.modalOverlay} role="dialog" aria-modal={true}>
            <div
                className={`${styles.modalContent} ${sizeClassMap[size]}`}
                ref={modalRef}
            >
                <div className={styles.modalHeader}>
                    <h3>{title}</h3>
                    <button onClick={onClose}>X</button>
                </div>
                
                {children}
            </div>
        </div>
    );
};

export default Modal;