import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  searchTerm?: string;
  onAddItem?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm,
  onAddItem,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
      <div className="rounded-full bg-muted/50 p-4">
        <FolderOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          {searchTerm
            ? `No se encontraron elementos para "${searchTerm}"`
            : "No hay elementos en el backlog"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {searchTerm
            ? "Intenta buscar con otros términos o ajusta los filtros aplicados"
            : "Comienza agregando elementos a tu backlog para organizar y priorizar tu trabajo"}
        </p>
      </div>
      {!searchTerm && onAddItem && (
        <Button
          onClick={onAddItem}
          className="bg-[#ac1754] hover:bg-[#8e0e3d] text-white"
        >
          Agregar elemento
        </Button>
      )}
    </div>
  );
};
