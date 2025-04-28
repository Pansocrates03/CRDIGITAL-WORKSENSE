// src/components/BacklogTable/utils.ts

/**
 * Retorna la clase CSS correspondiente al estado
 */
export const getStatusStyle = (status: string, styles: Record<string, string>) => {
    switch (status) {
      case "Sprint Backlog":
        return styles.statusSprintBacklog;
      case "In Progress":
        return styles.statusInProgress;
      case "In Review":
        return styles.statusInReview;
      case "Done":
        return styles.statusDone;
      default:
        return styles.statusUnassigned;
    }
  };
  
  /**
   * Retorna la clase CSS correspondiente a la prioridad
   */
  export const getPriorityStyle = (priority: string = "", styles: Record<string, string>) => {
    switch (priority.toLowerCase()) {
      case "high":
      case "alta":
        return styles.priorityHigh;
      case "medium":
      case "media":
        return styles.priorityMedium;
      case "low":
      case "baja":
        return styles.priorityLow;
      default:
        return styles.priorityUnset;
    }
  };
  
  /**
   * Genera una URL para el avatar basado en el nombre
   */
  export const getAvatarUrl = (name: string) => {
    const formattedName = name.replace(/\s+/g, "+");
    return `https://api.dicebear.com/7.x/initials/svg?seed=${formattedName}`;
  };