// services/projectCache.service.ts
import { db } from "../models/firebase.js";
import { Timestamp } from "firebase-admin/firestore";
import { BacklogItemType } from "../../types/BacklogItemType.js";
import { ProjectMember, ProjectContext } from "../../types/project.js";
import { ProjectRole, AvailablePermission } from "../../types/permissions.js";

interface CachedProjectData {
  projectData: any;
  members: any[];
  backlogItems: BacklogItemType[];
  projectRoles: Map<string, ProjectRole>;
  availablePermissions: Map<string, AvailablePermission>;
  sprints: any[];
  tasks: any[];
  lastUpdated: number;
  etag?: string;
}

class ProjectCacheService {
  private cache: Map<string, CachedProjectData> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos cache TTL
  private readonly STALE_WHILE_REVALIDATE = 10 * 60 * 1000; // 10 minutos stale-while-revalidate

  // Obtener datos de un proyecto con caché
  async getProjectData(
    projectId: string,
    forceRefresh: boolean = false
  ): Promise<CachedProjectData | null> {
    const now = Date.now();
    const cached = this.cache.get(projectId);

    if (cached && !forceRefresh) {
      const age = now - cached.lastUpdated;

      // Si el caché es reciente y está dentro del TTL, se devuelve directamente
      if (age < this.CACHE_TTL) {
        console.log(
          `Returning fresh cached data for project ${projectId} (age: ${age}ms)`
        );
        return cached;
      }

      // Si el caché es más antiguo que el TTL, pero aún dentro del período de revalidación
      // se devuelve el caché y se actualiza en segundo plano
      if (age < this.STALE_WHILE_REVALIDATE) {
        console.log(
          `Returning stale data and refreshing in background for project ${projectId}`
        );
        this.refreshProjectDataInBackground(projectId);
        return cached;
      }
    }

    console.log(`Fetching fresh data for project ${projectId}`);
    return await this.fetchAndCacheProjectData(projectId);
  }

  // Escucha actualizaciones en tiempo real de un proyecto
  subscribeToProjectUpdates(projectId: string): () => void {
    console.log(`Subscribing to updates for project ${projectId}`);

    const unsubscribers: (() => void)[] = [];

    // Abandonar suscripción a cambios en el proyecto
    const projectUnsubscribe = db
      .collection("projects")
      .doc(projectId)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          this.invalidateCache(projectId);
        }
      });
    unsubscribers.push(projectUnsubscribe);


    const backlogUnsubscribe = db
      .collection(`projects/${projectId}/backlog`)
      .onSnapshot(() => {
        this.invalidateCache(projectId);
      });
    unsubscribers.push(backlogUnsubscribe);

    const sprintsUnsubscribe = db
      .collection(`projects/${projectId}/sprints`)
      .onSnapshot(() => {
        this.invalidateCache(projectId);
      });
    unsubscribers.push(sprintsUnsubscribe);

    const tasksUnsubscribe = db
      .collection("tasks")
      .where("projectId", "==", projectId)
      .onSnapshot(() => {
        this.invalidateCache(projectId);
      });
    unsubscribers.push(tasksUnsubscribe);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }

  // Invalidar cache de un proyecto en especifico
  private invalidateCache(projectId: string): void {
    const cached = this.cache.get(projectId);
    if (cached) {
      cached.lastUpdated = 0; // Marcar como stale 
    }
  }

  // Refrescar datos de un proyecto en segundo plano
  private async refreshProjectDataInBackground(
    projectId: string
  ): Promise<void> {
    try {
      await this.fetchAndCacheProjectData(projectId);
    } catch (error) {
      console.error(
        `Error refreshing project ${projectId} in background:`,
        error
      );
    }
  }

  // Fetch cache datos del proyecto desde Firestore
  private async fetchAndCacheProjectData(
    projectId: string
  ): Promise<CachedProjectData | null> {
    try {
      // Empezar los fetchs en paralelo
      const [
        projectSnap,
        backlogSnap,
        membersSnap,
        rolesSnap,
        permissionsSnap,
        sprintsSnap,
        tasksSnap,
      ] = await Promise.all([
        db.collection("projects").doc(projectId).get(),
        db.collection(`projects/${projectId}/backlog`).get(),
        db.collection(`projects/${projectId}/members`).get(),
        db.collection("projectRoles").get(),
        db.collection("availablePermissions").get(),
        db.collection(`projects/${projectId}/sprints`).get(),
        db.collection("tasks").where("projectId", "==", projectId).get(),
      ]);

      if (!projectSnap.exists) {
        return null;
      }

      const projectData = projectSnap.data() || {};

      const availablePermissions: Map<string, AvailablePermission> = new Map();
      permissionsSnap.forEach((doc) => {
        const permission = doc.data() as AvailablePermission;
        availablePermissions.set(permission.key, permission);
      });

      const projectRoles: Map<string, ProjectRole> = new Map();
      rolesSnap.forEach((doc) => {
        const role = {
          id: doc.id,
          ...(doc.data() as Omit<ProjectRole, "id">),
        };
        projectRoles.set(doc.id, role);
      });

      const members: any[] = [];
      membersSnap.forEach((doc) => {
        const memberData = doc.data();
        const memberId = parseInt(doc.id, 10);
        members.push({
          userId: memberId,
          projectRoleId: memberData.projectRoleId || "",
          joinedAt: memberData.joinedAt,
        });
      });

      const backlogItems: BacklogItemType[] = [];
      const epicPromises: Promise<void>[] = [];

      backlogSnap.docs.forEach((doc) => {
        const item = {
          ...(doc.data() as BacklogItemType),
          id: doc.id,
        };
        backlogItems.push(item);

        if (item.type === "epic") {
          const epicPromise = db
            .collection(`projects/${projectId}/backlog/${item.id}/subitems`)
            .get()
            .then((subitemsSnap) => {
              subitemsSnap.docs.forEach((subDoc) => {
                const subitem = {
                  ...(subDoc.data() as BacklogItemType),
                  id: subDoc.id,
                  parentId: item.name || "Unnamed Epic",
                };
                if (subitem.type === "story") {
                  backlogItems.push(subitem);
                }
              });
            });
          epicPromises.push(epicPromise);
        }
      });

      await Promise.all(epicPromises);

      const sprints: any[] = [];
      sprintsSnap.docs.forEach((doc) => {
        sprints.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      const tasks: any[] = [];
      tasksSnap.docs.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Generar un etag
      const etag = this.generateEtag(
        projectData,
        members,
        backlogItems,
        sprints,
        tasks
      );

      const cachedData: CachedProjectData = {
        projectData,
        members,
        backlogItems,
        projectRoles,
        availablePermissions,
        sprints,
        tasks,
        lastUpdated: Date.now(),
        etag,
      };


      this.cache.set(projectId, cachedData);

      return cachedData;
    } catch (error) {
      return null;
    }
  }

  // Generar un etag para determinar si los datos han cambiado
  private generateEtag(
    projectData: any,
    members: any[],
    backlogItems: any[],
    sprints: any[],
    tasks: any[]
  ): string {
    const dataString = JSON.stringify({
      project: projectData.updatedAt?.toMillis() || 0,
      membersCount: members.length,
      backlogCount: backlogItems.length,
      backlogIds: backlogItems
        .map((item) => item.id)
        .sort()
        .join(","),
      sprintsCount: sprints.length,
      tasksCount: tasks.length,
      activeSprintId: sprints.find((s) => s.status === "Active")?.id || "none",
    });

    // funcion de hash
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; 
    }

    return hash.toString(36);
  }

  // Borrar el caché de un proyecto o de todos los proyectos
  clearCache(projectId?: string): void {
    if (projectId) {
      this.cache.delete(projectId);
    } else {
      this.cache.clear();
    }
  }

  // Obtener estadísticas del caché
  getCacheStats(): { size: number; projects: string[]; memoryUsage: number } {
    const projects = Array.from(this.cache.keys());
    const memoryUsage = projects.reduce((total, projectId) => {
      const cached = this.cache.get(projectId);
      if (cached) {
        // Calcular el tamaño de los datos en caché
        return total + JSON.stringify(cached).length;
      }
      return total;
    }, 0);

    return {
      size: this.cache.size,
      projects,
      memoryUsage,
    };
  }
}

export const projectCacheService = new ProjectCacheService();
