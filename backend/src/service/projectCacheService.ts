// services/projectCache.service.ts - Updated for new backend structure
import { db } from "../models/firebase.model.js";
import { Timestamp } from "firebase-admin/firestore";

interface CachedProjectData {
  projectData: any;
  members: any[];
  stories: any[];
  bugs: any[];
  tickets: any[];
  sprints: any[];
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
  async getProjectData(
    projectId: string,
    forceRefresh: boolean = false
  ): Promise<CachedProjectData | null> {
    const now = Date.now();
    const cached = this.cache.get(projectId);

    // Check if we have valid cached data
    if (cached && !forceRefresh) {
      const age = now - cached.lastUpdated;

      // If cache is fresh, return immediately
      if (age < this.CACHE_TTL) {
        console.log(
          `✅ Returning fresh cached data for project ${projectId} (age: ${age}ms)`
        );
        return cached;
      }

      // If cache is stale but within revalidation window, return stale data
      // and trigger background refresh
      if (age < this.STALE_WHILE_REVALIDATE) {
        console.log(
          `🔄 Returning stale data and refreshing in background for project ${projectId}`
        );
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
    const projectUnsubscribe = db
      .collection("projects")
      .doc(projectId)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          console.log(`📢 Project ${projectId} updated, invalidating cache`);
          this.invalidateCache(projectId);
        }
      });
    unsubscribers.push(projectUnsubscribe);

    // Subscribe to members changes
    const membersUnsubscribe = db
      .collection(`projects/${projectId}/members`)
      .onSnapshot(() => {
        console.log(
          `📢 Members for project ${projectId} updated, invalidating cache`
        );
        this.invalidateCache(projectId);
      });
    unsubscribers.push(membersUnsubscribe);

    // Subscribe to stories changes
    const storiesUnsubscribe = db
      .collection(`projects/${projectId}/stories`)
      .onSnapshot(() => {
        console.log(
          `📢 Stories for project ${projectId} updated, invalidating cache`
        );
        this.invalidateCache(projectId);
      });
    unsubscribers.push(storiesUnsubscribe);

    // Subscribe to bugs changes
    const bugsUnsubscribe = db
      .collection(`projects/${projectId}/bugs`)
      .onSnapshot(() => {
        console.log(
          `📢 Bugs for project ${projectId} updated, invalidating cache`
        );
        this.invalidateCache(projectId);
      });
    unsubscribers.push(bugsUnsubscribe);

    // Subscribe to tickets changes
    const ticketsUnsubscribe = db
      .collection(`projects/${projectId}/tickets`)
      .onSnapshot(() => {
        console.log(
          `📢 Tickets for project ${projectId} updated, invalidating cache`
        );
        this.invalidateCache(projectId);
      });
    unsubscribers.push(ticketsUnsubscribe);

    // Subscribe to sprints changes
    const sprintsUnsubscribe = db
      .collection(`projects/${projectId}/sprints`)
      .onSnapshot(() => {
        console.log(
          `📢 Sprints for project ${projectId} updated, invalidating cache`
        );
        this.invalidateCache(projectId);
      });
    unsubscribers.push(sprintsUnsubscribe);

    // Return unsubscribe function
    return () => {
      unsubscribers.forEach((unsub) => unsub());
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
  private async refreshProjectDataInBackground(
    projectId: string
  ): Promise<void> {
    try {
      await this.fetchAndCacheProjectData(projectId);
    } catch (error) {
      console.error(
        `❌ Error refreshing project ${projectId} in background:`,
        error
      );
    }
  }

  /**
   * Fetch and cache all project data
   */
  private async fetchAndCacheProjectData(
    projectId: string
  ): Promise<CachedProjectData | null> {
    try {
      // Start all fetches in parallel
      const [
        projectSnap,
        membersSnap,
        storiesSnap,
        bugsSnap,
        ticketsSnap,
        rolesSnap,
        permissionsSnap,
        sprintsSnap,
      ] = await Promise.all([
        db.collection("projects").doc(projectId).get(),
        db.collection(`projects/${projectId}/members`).get(),
        db.collection(`projects/${projectId}/stories`).get(),
        db.collection(`projects/${projectId}/bugs`).get(),
        db.collection(`projects/${projectId}/tickets`).get(),
        db.collection("projectRoles").get(),
        db.collection("availablePermissions").get(),
        db.collection(`projects/${projectId}/sprints`).get(),
      ]);

      if (!projectSnap.exists) {
        return null;
      }

      const projectData = projectSnap.data() || {};

      // Process members with embedded user data (no SQL enrichment needed)
      const members: any[] = [];
      const userFetchPromises: Promise<void>[] = [];

      membersSnap.forEach((doc) => {
        const memberData = doc.data();
        const userId = doc.id; // Document ID is the userId

        // Create a promise to fetch user data from users collection
        const userPromise = db
          .collection("users")
          .doc(userId)
          .get()
          .then((userSnap) => {
            const userData = userSnap.exists ? userSnap.data() : {};
            delete userData?.password; // Remove sensitive data


            members.push({
              userId: userId,
              projectRoleId: memberData.projectRoleId || "",
              joinedAt: memberData.joinedAt,
              updatedAt: memberData.updatedAt,
              // User data
              name: userData?.firstName && userData?.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : undefined,
              fullName: userData?.firstName && userData?.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : undefined,
              firstName: userData?.firstName,
              lastName: userData?.lastName,
              email: userData?.email,
              nickName: userData?.nickName,
              pfp: userData?.pfp,
              platformRole: userData?.platformRole,
            });
          })
          .catch((error) => {
            console.error(`Error fetching user data for ${userId}:`, error);
            // Add member with minimal data if user fetch fails
            members.push({
              userId: userId,
              projectRoleId: memberData.projectRoleId || "",
              joinedAt: memberData.joinedAt,
              updatedAt: memberData.updatedAt,
              name: `User ${userId}`,
              fullName: `User ${userId}`,
            });
          });

        userFetchPromises.push(userPromise);
      });

      // Wait for all user data to be fetched
      await Promise.all(userFetchPromises);

      // Process stories
      const stories: any[] = [];
      storiesSnap.docs.forEach((doc) => {
        stories.push({
          id: doc.id,
          type: "story", // Explicitly set type
          ...doc.data(),
        });
      });

      // Process bugs
      const bugs: any[] = [];
      bugsSnap.docs.forEach((doc) => {
        bugs.push({
          id: doc.id,
          type: "bug", // Explicitly set type
          ...doc.data(),
        });
      });

      // Process tickets
      const tickets: any[] = [];
      ticketsSnap.docs.forEach((doc) => {
        tickets.push({
          id: doc.id,
          type: "ticket", // Explicitly set type
          ...doc.data(),
        });
      });

      // Process sprints
      const sprints: any[] = [];
      sprintsSnap.docs.forEach((doc) => {
        sprints.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Generate etag based on data
      const etag = this.generateEtag(
        projectData,
        members,
        stories,
        bugs,
        tickets,
        sprints
      );

      const cachedData: CachedProjectData = {
        projectData,
        members,
        stories,
        bugs,
        tickets,
        sprints,
        lastUpdated: Date.now(),
        etag,
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
  private generateEtag(
    projectData: any,
    members: any[],
    stories: any[],
    bugs: any[],
    tickets: any[],
    sprints: any[]
  ): string {
    const dataString = JSON.stringify({
      project: projectData.updatedAt?.toMillis() || 0,
      membersCount: members.length,
      storiesCount: stories.length,
      bugsCount: bugs.length,
      ticketsCount: tickets.length,
      sprintsCount: sprints.length,
      activeSprintId: sprints.find((s) => s.status === "Active")?.id || "none",
    });

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
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
      memoryUsage,
    };
  }
}

// Export singleton instance
export const projectCacheService = new ProjectCacheService();