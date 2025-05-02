// src/types/ai.ts

/**
 * Interfaz para las prioridades disponibles en el sistema
 */
export type Priority = "lowest" | "low" | "medium" | "high" | "highest";

/**
 * Interfaz para las sugerencias de historias de usuario generadas por IA
 */
export interface AiStorySuggestion {
  name: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  acceptanceCriteria: string[] | null;
  size: "XS" | "S" | "M" | "L" | "XL" | null;
}

/**
 * Interfaz para las sugerencias de épicas generadas por IA
 */
export interface AiEpicSuggestion {
  name: string;
  description: string | null;
  priority: Priority;
}

/**
 * Interfaz para la respuesta de la API al generar historias
 */
export interface GenerateStoriesResponse {
  stories: AiStorySuggestion[];
}

/**
 * Interfaz para la respuesta de la API al generar épicas
 */
export interface GenerateEpicsResponse {
  epics: AiEpicSuggestion[];
}

/**
 * Interfaz para la solicitud de generación de historias
 */
export interface GenerateStoriesRequest {
  epicId: string;
}

/**
 * Interfaz extendida para el envío de historias al backend
 * Incluye tanto description como content para compatibilidad
 */
interface StoryWithContent extends AiStorySuggestion {
  content?: string | null;
}

/**
 * Interfaz para la solicitud de confirmación de historias
 */
export interface ConfirmStoriesRequest {
  epicId: string;
  stories: StoryWithContent[];
}

/**
 * Interfaz para la solicitud de confirmación de épicas
 */
export interface ConfirmEpicsRequest {
  epics: AiEpicSuggestion[];
}
