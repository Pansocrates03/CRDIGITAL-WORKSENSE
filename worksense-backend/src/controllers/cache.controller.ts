// controllers/cache.controller.ts
import { Request, Response } from "express";
import { projectCacheService } from "../service/projectCache.service.js";

/**
 * Get cache statistics
 */
export const getCacheStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = projectCacheService.getCacheStats();
    
    res.json({
      success: true,
      stats: {
        projectsCached: stats.size,
        projects: stats.projects,
        memoryUsageKB: (stats.memoryUsage / 1024).toFixed(2),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving cache statistics"
    });
  }
};

/**
 * Clear cache for a specific project or all projects
 */
export const clearCache = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;
    
    if (projectId) {
      projectCacheService.clearCache(projectId);
      res.json({
        success: true,
        message: `Cache cleared for project ${projectId}`,
        timestamp: new Date().toISOString()
      });
    } else {
      projectCacheService.clearCache();
      res.json({
        success: true,
        message: "All cache cleared",
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cache"
    });
  }
};

/**
 * Force refresh cache for a specific project
 */
export const refreshProjectCache = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
      return;
    }
    
    // Force refresh by passing true as second parameter
    const data = await projectCacheService.getProjectData(projectId, true);
    
    if (!data) {
      res.status(404).json({
        success: false,
        message: "Project not found"
      });
      return;
    }
    
    res.json({
      success: true,
      message: `Cache refreshed for project ${projectId}`,
      timestamp: new Date().toISOString(),
      cacheAge: 0
    });
  } catch (error) {
    console.error("Error refreshing cache:", error);
    res.status(500).json({
      success: false,
      message: "Error refreshing cache"
    });
  }
};