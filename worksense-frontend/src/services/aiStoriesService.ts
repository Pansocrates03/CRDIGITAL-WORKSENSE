// src/services/aiStoriesService.ts
import apiClient from "@/api/apiClient";
import {
  AiStorySuggestion,
  GenerateStoriesResponse,
  GenerateStoriesRequest,
  ConfirmStoriesRequest,
} from "@/types/ai";

// Caché para las historias generadas
const storiesCache = new Map<string, AiStorySuggestion[]>();

/**
 * Servicio para manejar la generación y confirmación de historias de usuario usando IA
 */
export const aiStoriesService = {
  /**
   * Genera sugerencias de historias de usuario para una épica
   * @param projectId - ID del proyecto
   * @param epicId - ID de la épica
   * @returns Lista de historias sugeridas
   */
  async generateStories(
    projectId: string,
    epicId: string
  ): Promise<AiStorySuggestion[]> {
    try {
      // Verificar si ya tenemos historias en caché para esta épica
      if (storiesCache.has(epicId)) {
        return storiesCache.get(epicId) || [];
      }

      // Si no hay caché, llamar a la API
      const response = await apiClient.post<GenerateStoriesResponse>(
        `/projects/${projectId}/ai/stories/generate-stories`,
        { epicId } as GenerateStoriesRequest
      );

      // Guardar en caché
      if (response.data && Array.isArray(response.data.stories)) {
        storiesCache.set(epicId, response.data.stories);
        return response.data.stories;
      }

      return [];
    } catch (error) {
      console.error("Error generating stories:", error);
      throw error;
    }
  },

  /**
   * Confirma y guarda historias seleccionadas en el backlog
   * @param projectId - ID del proyecto
   * @param epicId - ID de la épica
   * @param stories - Lista de historias a guardar
   */
  async confirmStories(
    projectId: string,
    epicId: string,
    stories: AiStorySuggestion[]
  ): Promise<void> {
    try {
      // Enviar tanto description como content para garantizar compatibilidad
      await apiClient.post(
        `/projects/${projectId}/ai/stories/confirm-stories`,
        {
          epicId,
          stories: stories.map((story) => ({
            name: story.name,
            description: story.description,
            priority: story.priority,
            acceptanceCriteria: story.acceptanceCriteria,
            size: story.size,
            type: "story",
            status: "new",
          })),
        } as ConfirmStoriesRequest
      );

      // Limpiar caché después de confirmar
      storiesCache.delete(epicId);
    } catch (error) {
      console.error("Error confirming stories:", error);
      throw error;
    }
  },

  /**
   * Elimina las historias en caché para una épica específica
   * @param epicId - ID de la épica
   */
  clearCache(epicId: string): void {
    storiesCache.delete(epicId);
  },

  /**
   * Elimina todas las historias en caché
   */
  clearAllCache(): void {
    storiesCache.clear();
  },
};

export default aiStoriesService;
