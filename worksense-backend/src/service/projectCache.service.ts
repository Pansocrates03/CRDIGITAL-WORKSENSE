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
  lastUpdated: number;
  etag?: string;
}

class ProjectCacheService {
  private cache: Map<string, CachedProjectData> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
  private readonly STALE_WHILE_REVALIDATE = 10 * 60 * 1000; // 10 minutes stale-while-revalidate

  /**
   * Get project data with caching and change detection
   */
  async getProjectData(projectId: string, forceRefresh: boolean = false): Promise<CachedProjectData | null> {
    const now = Date.now();
    const cached = this.cache.get(projectId);
    
    // Check if we have valid cached data
    if (cached && !forceRefresh) {
      const age = now - cached.lastUpdated;
      
      // If cache is fresh, return immediately
      if (age < this.CACHE_TTL) {
        console.log(`✅ Returning fresh cached data for project ${projectId} (age: ${age}ms)`);
        return cached;
      }
      
      // If cache is stale but within revalidation window, return stale data
      // and trigger background refresh
      if (age < this.STALE_WHILE_REVALIDATE) {
        console.log(`🔄 Returning stale data and refreshing in background for project ${projectId}`);
        this.refreshProjectDataInBackground(projectId);
        return cached;
      }
    }
    
    // Fetch fresh data
    console.log(`🔍 Fetching fresh data for project ${projectId}`);
    return await this.fetchAndCacheProjectData(projectId);
  }

  /**
   * Listen for real-time updates on project data
   */
  subscribeToProjectUpdates(projectId: string): () => void {
    console.log(`👂 Subscribing to updates for project ${projectId}`);
    
    const unsubscribers: (() => void)[] = [];
    
    // Subscribe to project document changes
    const projectUnsubscribe = db.collection("projects").doc(projectId)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          console.log(`📢 Project ${projectId} updated, invalidating cache`);
          this.invalidateCache(projectId);
        }
      });
    unsubscribers.push(projectUnsubscribe);
    
    // Subscribe to backlog changes
    const backlogUnsubscribe = db.collection(`projects/${projectId}/backlog`)
      .onSnapshot(() => {
        console.log(`📢 Backlog for project ${projectId} updated, invalidating cache`);
        this.invalidateCache(projectId);
      });
    unsubscribers.push(backlogUnsubscribe);
    
    // Subscribe to members changes
    const membersUnsubscribe = db.collection(`projects/${projectId}/members`)
      .onSnapshot(() => {
        console.log(`📢 Members for project ${projectId} updated, invalidating cache`);
        this.invalidateCache(projectId);
      });
    unsubscribers.push(membersUnsubscribe);
    
    // Return unsubscribe function
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Invalidate cache for a specific project
   */
  private invalidateCache(projectId: string): void {
    const cached = this.cache.get(projectId);
    if (cached) {
      // Mark as stale by setting lastUpdated to 0
      cached.lastUpdated = 0;
    }
  }

  /**
   * Refresh project data in the background
   */
  private async refreshProjectDataInBackground(projectId: string): Promise<void> {
    try {
      await this.fetchAndCacheProjectData(projectId);
    } catch (error) {
      console.error(`❌ Error refreshing project ${projectId} in background:`, error);
    }
  }

  /**
   * Fetch and cache all project data
   */
  private async fetchAndCacheProjectData(projectId: string): Promise<CachedProjectData | null> {
    try {
      // Start all fetches in parallel
      const [
        projectSnap,
        backlogSnap,
        membersSnap,
        rolesSnap,
        permissionsSnap
      ] = await Promise.all([
        db.collection("projects").doc(projectId).get(),
        db.collection(`projects/${projectId}/backlog`).get(),
        db.collection(`projects/${projectId}/members`).get(),
        db.collection("projectRoles").get(),
        db.collection("availablePermissions").get()
      ]);

      if (!projectSnap.exists) {
        return null;
      }

      const projectData = projectSnap.data() || {};
      
      // Process permissions
      const availablePermissions: Map<string, AvailablePermission> = new Map();
      permissionsSnap.forEach((doc) => {
        const permission = doc.data() as AvailablePermission;
        availablePermissions.set(permission.key, permission);
      });

      // Process roles
      const projectRoles: Map<string, ProjectRole> = new Map();
      rolesSnap.forEach((doc) => {
        const role = {
          id: doc.id,
          ...(doc.data() as Omit<ProjectRole, "id">)
        };
        projectRoles.set(doc.id, role);
      });

      // Process members
      const members: any[] = [];
      membersSnap.forEach((doc) => {
        const memberData = doc.data();
        const memberId = parseInt(doc.id, 10);
        members.push({
          userId: memberId,
          projectRoleId: memberData.projectRoleId || "",
          joinedAt: memberData.joinedAt
        });
      });

      // Process backlog items and fetch epic subitems in parallel
      const backlogItems: BacklogItemType[] = [];
      const epicPromises: Promise<void>[] = [];

      backlogSnap.docs.forEach((doc) => {
        const item = {
          ...(doc.data() as BacklogItemType),
          id: doc.id,
        };
        backlogItems.push(item);

        // If it's an epic, fetch subitems
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

      // Wait for all epic subitems to be fetched
      await Promise.all(epicPromises);

      // Generate etag based on data
      const etag = this.generateEtag(projectData, members, backlogItems);

      const cachedData: CachedProjectData = {
        projectData,
        members,
        backlogItems,
        projectRoles,
        availablePermissions,
        lastUpdated: Date.now(),
        etag
      };

      // Cache the data
      this.cache.set(projectId, cachedData);
      console.log(`✅ Cached project data for ${projectId}`);

      return cachedData;
    } catch (error) {
      console.error(`❌ Error fetching project data for ${projectId}:`, error);
      return null;
    }
  }

  /**
   * Generate an etag for change detection
   */
  private generateEtag(projectData: any, members: any[], backlogItems: any[]): string {
    const dataString = JSON.stringify({
      project: projectData.updatedAt?.toMillis() || 0,
      membersCount: members.length,
      backlogCount: backlogItems.length,
      backlogIds: backlogItems.map(item => item.id).sort().join(',')
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString(36);
  }

  /**
   * Clear cache for a specific project or all projects
   */
  clearCache(projectId?: string): void {
    if (projectId) {
      this.cache.delete(projectId);
      console.log(`🗑️ Cleared cache for project ${projectId}`);
    } else {
      this.cache.clear();
      console.log(`🗑️ Cleared all project cache`);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; projects: string[]; memoryUsage: number } {
    const projects = Array.from(this.cache.keys());
    const memoryUsage = projects.reduce((total, projectId) => {
      const cached = this.cache.get(projectId);
      if (cached) {
        // Rough estimate of memory usage
        return total + JSON.stringify(cached).length;
      }
      return total;
    }, 0);

    return {
      size: this.cache.size,
      projects,
      memoryUsage
    };
  }
}

// Export singleton instance
export const projectCacheService = new ProjectCacheService();