import React, { useState } from 'react';
import styles from './ProjectForm.module.css';

const ProjectForm: React.FC = () => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 4) {
      console.log('Proyecto creado:', name);
      // lógica para guardar el proyecto
    } else {
      alert('El nombre debe tener al menos 4 caracteres.');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>Nombre del Proyecto</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
        placeholder="Ej. Frida Planner"
        required
      />
      <button type="submit" className={styles.button}>
        Crear Proyecto
      </button>
    </form>
  );
};

export default ProjectForm;
