// src/pages/Backlog/BacklogPage.tsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { BacklogList } from "@/components/Backlog/BacklogList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon } from "lucide-react";
import BacklogModal from "@/components/Backlog/BacklogModal";
// import { Separator } from "@/components/ui/separator"; // No se encontró, usamos un div

const BacklogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParentItemId, setSelectedParentItemId] = useState<
    string | null
  >(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Basic check in case the ID isn't found in the URL (though routing should handle this)
  if (!id) {
    // You might want a more robust error component here
    return <div>Error: Project ID not found in URL.</div>;
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenModal = (parentItemId: string | null) => {
    setSelectedParentItemId(parentItemId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedParentItemId(null);
  };

  const handleSuccess = () => {
    // Incrementar la clave para forzar la actualización del componente BacklogList
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 py-4">
      {" "}
      {/* Añadir padding y espacio vertical */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Backlog Items
          </h2>
          <p className="text-muted-foreground mt-1">
            View, prioritize, and manage all tasks, stories, and epics for your
            project.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Input de búsqueda */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8 w-full"
            />
          </div>
          <Button
            variant="default"
            size="default"
            className="bg-[#ac1754] hover:bg-[#8e0e3d] flex-shrink-0"
            onClick={() => handleOpenModal(null)}
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>
      {/* Usar un div como separador */}
      <div className="border-b border-border my-4"></div>
      {/* Opciones de filtrado/ordenamiento podrían ir aquí */}
      {/* <div className="mb-6"> ... filtro ... </div> */}
      <BacklogList
        projectId={id}
        searchTerm={searchTerm}
        key={refreshKey}
        onAddSubItem={handleOpenModal}
      />
      {/* Modal para crear elementos y subelementos */}
      <BacklogModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        projectId={id}
        parentItemId={selectedParentItemId}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default BacklogPage; // Default export for lazy loading or standard import
