// src/pages/Backlog/BacklogPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { BacklogList } from "@/components/Backlog/BacklogList"; // Usar importación con alias @

const BacklogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the project ID from the URL

  // Basic check in case the ID isn't found in the URL (though routing should handle this)
  if (!id) {
    // You might want a more robust error component here
    return <div>Error: Project ID not found in URL.</div>;
  }

  return (
    <>
      {/* No Header needed - MainLayout provides it */}
      {/* No container div needed - MainLayout provides it */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Elementos del Backlog</h2>
        <p className="text-gray-600">
          Gestiona los elementos del backlog de tu proyecto.
        </p>
      </div>

      {/* Opciones de filtrado/ordenamiento podrían ir aquí */}
      <div className="mb-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Añadir Elemento +
        </button>
      </div>

      <BacklogList projectId={id} />
    </>
  );
};

export default BacklogPage; // Default export for lazy loading or standard import
