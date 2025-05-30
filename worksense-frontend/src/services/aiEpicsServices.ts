// src/services/aiEpicsService.ts
import apiClient from "@/api/apiClient";
import { endpoints } from "@/lib/constants/endpoints";
import {
  AiEpicSuggestion,
  GenerateEpicsResponse,
  ConfirmEpicsRequest,
} from "@/types/ai";

// Caché para las épicas generadas
const epicsCache = new Map<string, AiEpicSuggestion[]>();

/**
 * Servicio para manejar la generación y confirmación de épicas usando IA
 */
export const aiEpicsService = {
  /**
   * Genera sugerencias de épicas para un proyecto
   * @param projectId - ID del proyecto
   * @returns Lista de épicas sugeridas
   */
  async generateEpics(projectId: string): Promise<AiEpicSuggestion[]> {
    try {
      const response = await apiClient.get<GenerateEpicsResponse>(endpoints.generateEpics(projectId));
      console.log("Epics received", response.data)
      return response.data.epics
    } catch (error) {
      console.error("Error generating epics:", error);
      throw error;
    }
  },

  /**
   * Confirma y guarda épicas seleccionadas en el backlog
   * @param projectId - ID del proyecto
   * @param epics - Lista de épicas a guardar
   */
  async confirmEpics(
    projectId: string,
    epics: AiEpicSuggestion[]
  ): Promise<void> {
    try {
      await apiClient.post(
        `/projects/${projectId}/ai/confirm-epics`,
        {
          epics: epics.map((epic) => ({
            name: epic.name,
            description: epic.description,
            priority: epic.priority,
            type: "epic",
            status: "new",
          })),
        } as ConfirmEpicsRequest
      );

      // Limpiar caché después de confirmar
      epicsCache.delete(projectId);
    } catch (error) {
      console.error("Error confirming epics:", error);
      throw error;
    }
  },

  /**
   * Elimina las épicas en caché para un proyecto específico
   * @param projectId - ID del proyecto
   */
  clearCache(projectId: string): void {
    epicsCache.delete(projectId);
  },

  /**
   * Elimina todas las épicas en caché
   */
  clearAllCache(): void {
    epicsCache.clear();
  },
};

export default aiEpicsService;