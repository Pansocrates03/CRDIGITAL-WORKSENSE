// src/services/aiEpicsService.ts
import apiClient from "@/api/apiClient";
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
      // Verificar si ya tenemos épicas en caché para este proyecto
      if (epicsCache.has(projectId)) {
        return epicsCache.get(projectId) || [];
      }

      // Si no hay caché, llamar a la API
      const response = await apiClient.post<GenerateEpicsResponse>(
        `/projects/${projectId}/ai/generate-epics`
      );

      // Guardar en caché
      if (response.data && Array.isArray(response.data.epics)) {
        epicsCache.set(projectId, response.data.epics);
        return response.data.epics;
      }

      return [];
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