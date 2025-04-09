// src/components/BacklogList.tsx
import React, { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";
import { BacklogItemType } from "@/types";

interface BacklogListProps {
  projectId: string;
}

export const BacklogList: React.FC<BacklogListProps> = ({ projectId }) => {
  const [backlogItems, setBacklogItems] = useState<BacklogItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBacklogItems = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- LÓGICA PARA CARGAR DATOS REALES (descomentar y adaptar) ---
        // const response = await apiClient.get(`/projects/${projectId}/backlog`);
        // setBacklogItems(response.data);
        // -----------------------------------------------------------

        // --- DATOS DE EJEMPLO (eliminar cuando uses datos reales) ---
        console.log(`Cargando backlog para proyecto: ${projectId}`);
        const exampleData: BacklogItemType[] = [
          {
            id: "1",
            projectID: projectId,
            name: `Tarea 1 P${projectId}`,
            description: "Descripción de la tarea 1",
            status: "backlog",
            priority: "high",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            projectID: projectId,
            name: `Tarea 2 P${projectId}`,
            description: "Descripción de la tarea 2",
            status: "inprogress",
            priority: "medium",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "3",
            projectID: projectId,
            name: `Tarea 3 P${projectId}`,
            description: "Descripción de la tarea 3",
            status: "done",
            priority: "high",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simular carga
        setBacklogItems(exampleData);
        // ----------------------------------------------------------
      } catch (err) {
        console.error("Error fetching backlog items:", err);
        setError("Error al cargar los elementos del backlog.");
      } finally {
        setLoading(false);
      }
    };

    fetchBacklogItems();
  }, [projectId]); // Recargar si cambia el projectId

  if (loading) {
    return <div>Cargando backlog...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
        <thead>
          <tr className="w-full bg-gray-100 dark:bg-neutral-700 text-left text-sm font-semibold text-gray-600 dark:text-neutral-300">
            <th className="py-2 px-4 border-b dark:border-neutral-600">ID</th>
            <th className="py-2 px-4 border-b dark:border-neutral-600">
              Nombre
            </th>
            <th className="py-2 px-4 border-b dark:border-neutral-600">
              Estado
            </th>
            <th className="py-2 px-4 border-b dark:border-neutral-600">
              Prioridad
            </th>
            <th className="py-2 px-4 border-b dark:border-neutral-600">
              Descripción
            </th>
          </tr>
        </thead>
        <tbody>
          {backlogItems.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="text-center py-4 text-gray-500 dark:text-neutral-400"
              >
                El backlog está vacío.
              </td>
            </tr>
          ) : (
            backlogItems.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-neutral-700 text-sm text-gray-700 dark:text-neutral-300"
              >
                <td className="py-2 px-4 border-b dark:border-neutral-600">
                  {item.id}
                </td>
                <td className="py-2 px-4 border-b dark:border-neutral-600">
                  {item.name}
                </td>
                <td className="py-2 px-4 border-b dark:border-neutral-600">
                  {item.status}
                </td>
                <td className="py-2 px-4 border-b dark:border-neutral-600">
                  {item.priority}
                </td>
                <td className="py-2 px-4 border-b dark:border-neutral-600">
                  {item.description}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BacklogList;
