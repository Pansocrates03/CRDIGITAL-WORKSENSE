// Core Imports
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProjectView.module.css";
import apiClient from "@/api/apiClient";
import { useNavigate } from "react-router-dom";

// Component Imports
import EditTeamModal from "../EditTeamModal/EditTeamModal";
import MemberInfoPopup from "../MemberInfoPopup/MemberInfoPopup";
import ActivityFeed from "@/components/ActivityFeed";

// Hooks
import { useProjectStats } from "@/hooks/useProjectStats";
import { useProjectLeaderboard } from "@/hooks/useProjectLeaderboard";

// Type Imports
import ProjectDetails from "@/types/ProjectType";
import MemberDetailed from "@/types/MemberDetailedType";

import { AvatarDisplay } from "../ui/AvatarDisplay";

// Lucide icons for enhanced stats
import {
  Users,
  Target,
  CheckCircle,
  Zap,
  Award,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

type FullProjectData = {
  project: ProjectDetails;
  members: MemberDetailed[];
};

export const ProjectView: React.FC<FullProjectData> = ({
  project,
  members,
}) => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Add this line

  // Real data hooks
  const { data: projectStats, isLoading: statsLoading } = useProjectStats(
    projectId!
  );
  const { data: leaderboard, isLoading: leaderboardLoading } =
    useProjectLeaderboard(projectId!, 3);

  // Local state
  const [backlogItems, setBacklogItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<MemberDetailed[]>(members);
  const [selectedMember, setSelectedMember] = useState<MemberDetailed | null>(
    null
  );
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch backlog items
        const backlogResponse = await apiClient.get(
          `/projects/${projectId}/backlog/items`
        );
        const items = backlogResponse.data;
        setBacklogItems(items);
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  useEffect(() => {
    setTeamMembers(members);
  }, [members]);

  const handleTeamUpdate = (newTeam: MemberDetailed[]) => {
    setTeamMembers(newTeam);
  };

  const handleAvatarClick = (
    member: MemberDetailed,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    setSelectedMember(member);
  };

  const getOwnerName = (
    projectDetails: ProjectDetails,
    members: MemberDetailed[]
  ) => {
    const owner = members.find(
      (member) => member.userId === projectDetails.ownerId
    );
    return owner?.name;
  };

  // Fix the status counting logic - properly handle epics and their sub-items
  const calculateWorkItems = (items: any[]) => {
    const workItems: any[] = [];

    items.forEach((item) => {
      if (item.type === "epic") {
        // Don't count the epic itself, but add its sub-items
        if (item.subItems && Array.isArray(item.subItems)) {
          workItems.push(...item.subItems);
        }
      } else {
        // Count regular stories and other non-epic items
        workItems.push(item);
      }
    });

    return workItems;
  };

  const allWorkItems = calculateWorkItems(backlogItems || []);

  // Helper function to normalize status values and check for "in progress" variations
  const isInProgress = (status: string) => {
    if (!status) return false;
    const normalizedStatus = status.toLowerCase().replace(/[_\s-]/g, "");
    return (
      normalizedStatus === "inprogress" ||
      normalizedStatus === "in_progress" ||
      normalizedStatus === "in-progress" ||
      normalizedStatus === "in progress" ||
      normalizedStatus === "inprogress"
    );
  };

  const isDone = (status: string) => {
    if (!status) return false;
    const normalizedStatus = status.toLowerCase().replace(/[_\s-]/g, "");
    return normalizedStatus === "done";
  };

  // Debug logging (remove in production)
  console.log("Total backlog items:", backlogItems?.length || 0);
  console.log("Calculated work items:", allWorkItems.length);
  console.log(
    "ProjectStats totalBacklogItems:",
    projectStats?.totalBacklogItems
  );
  console.log("Status breakdown:", {
    done: allWorkItems.filter((item) => isDone(item.status)).length,
    inProgress: allWorkItems.filter((item) => isInProgress(item.status)).length,
    other: allWorkItems.filter(
      (item) => !isDone(item.status) && !isInProgress(item.status)
    ).length,
  });

  // ALWAYS use the corrected calculation, not the API stats (which counts epics incorrectly)
  const completedTasks = allWorkItems.filter((item: any) =>
    isDone(item.status)
  ).length;
  const totalTasks = allWorkItems.length; // Use calculated total, not API total
  const inProgressTasks = allWorkItems.filter((item: any) =>
    isInProgress(item.status)
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  return (
    <div className={styles.projectView}>
      {/* Compact Header with Collapsible About */}
      <div className={styles.compactHeader}>
        <div className={styles.projectIdentity}>
          <div className={styles.projectDetails}>
            <div className={styles.titleRow}>
              <button
                className={styles.aboutToggle}
                onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                aria-label={
                  isAboutExpanded
                    ? "Hide project description"
                    : "Show project description"
                }
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isAboutExpanded ? "rotate-180" : ""
                  }`}
                  style={{ color: "var(--neutral-600)" }}
                />
              </button>
              <div
                className={
                  "space-inline-x-2 flex items-center justify-between w-full"
                }
              >
                <h1>{project.name}</h1>
              </div>
              <div className={styles.quickActions}>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/project/${projectId}/users`)}
                >
                  Manage Team
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate(`/project/${projectId}/workflow`)}
                >
                  View Sprint Board
                </Button>
              </div>
            </div>
            <span>
              {getOwnerName(project, members)} • {members.length} members
            </span>

            {/* Collapsible About */}
            {isAboutExpanded && (
              <div className={styles.aboutDropdown}>
                <p>{project.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Dashboard - Single Row */}
      <div className={styles.dashboard}>
        {/* Left: Progress & Stats */}
        <div className={styles.progressPanel}>
          <div className={styles.panelHeader}>
            <h3>Project Progress</h3>
            <span className={styles.completionRate}>
              {statsLoading ? "..." : `${completionRate}% Complete`}
            </span>
          </div>

          <div className={styles.progressStats}>
            <div className={styles.statRow}>
              <div className={styles.stat}>
                <Zap
                  className="w-4 h-4"
                  style={{ color: "var(--accent-pink)" }}
                />
                <span className={styles.statValue}>
                  {statsLoading ? "..." : projectStats?.totalPoints || 0}
                </span>
                <span className={styles.statLabel}>Total Points</span>
              </div>
              <div className={styles.stat}>
                <Target
                  className="w-4 h-4"
                  style={{ color: "var(--accent-blue)" }}
                />
                <span className={styles.statValue}>{totalTasks}</span>
                <span className={styles.statLabel}>Total Items</span>
              </div>
            </div>

            <div className={styles.statRow}>
              <div className={styles.stat}>
                <CheckCircle
                  className="w-4 h-4"
                  style={{ color: "var(--success)" }}
                />
                <span className={styles.statValue}>{completedTasks}</span>
                <span className={styles.statLabel}>Completed</span>
              </div>
              <div className={styles.stat}>
                <Clock
                  className="w-4 h-4"
                  style={{ color: "var(--warning)" }}
                />
                <span className={styles.statValue}>{inProgressTasks}</span>
                <span className={styles.statLabel}>In Progress</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Center: Team Status */}
        <div className={styles.teamPanel}>
          <div className={styles.panelHeader}>
            <h3>Team Status</h3>
            <span className={styles.activeCount}>{members.length} active</span>
          </div>

          <div className={styles.teamGrid}>
            {members.map((member) => (
              <div
                key={member.userId}
                className={styles.teamMember}
                onClick={(e) => handleAvatarClick(member, e)}
              >
                <AvatarDisplay
                  user={{
                    name: member.name,
                    profilePicture: member.profilePicture,
                  }}
                  size="md"
                />
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{member.name}</span>
                  <span className={styles.memberRole}>
                    {member.projectRoleId}
                  </span>
                </div>
                <div className={styles.memberActivity}>
                  <span className={styles.activityDot}></span>
                  <span className={styles.activityStatus}>Active</span>
                </div>
              </div>
            ))}
          </div>

          {/* Top Contributors - Real Data */}
          <div className={styles.topContributors}>
            <h4>Top Contributors</h4>
            {leaderboardLoading ? (
              <div style={{ color: "var(--neutral-600)", fontSize: "0.85rem" }}>
                Loading contributors...
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((contributor: any, index: number) => (
                  <div
                    key={contributor.userId}
                    className="flex items-center justify-between p-2 rounded transition-colors"
                    style={{
                      backgroundColor: "var(--surface-light)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--surface-light-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--surface-light)";
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-medium"
                        style={{
                          color:
                            index === 0
                              ? "var(--accent-pink)"
                              : "var(--text-primary)",
                        }}
                      >
                        {index === 0 && "🏆"} {contributor.name}
                      </span>
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--accent-blue)" }}
                    >
                      {contributor.points} pts
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--neutral-600)" }}>
                No contributors yet
              </p>
            )}
          </div>
        </div>

        {/* Right: Activity Feed - Real Data */}
        <div className={styles.activityPanel}>
          <div className={styles.panelHeader}>
            <h3>Recent Activity</h3>
            <span className={styles.lastUpdate}>Live updates</span>
          </div>

          {/* Real Activity Feed */}
          {projectId ? (
            <div className={styles.activityFeed}>
              <ActivityFeed projectId={projectId} limit={5} />
            </div>
          ) : (
            <div style={{ color: "var(--neutral-600)" }}>
              Loading activity...
            </div>
          )}

          {/* Current Sprint Items */}
          <div className={styles.currentTasks}>
            <h4>Current Sprint Items</h4>
            <div className={styles.taskList}>
              {loading ? (
                <div
                  style={{ color: "var(--neutral-600)", fontSize: "0.85rem" }}
                >
                  Loading items...
                </div>
              ) : backlogItems.length > 0 ? (
                backlogItems
                  .sort((a, b) => {
                    const dateA =
                      a.updatedAt?._seconds || a.createdAt?._seconds || 0;
                    const dateB =
                      b.updatedAt?._seconds || b.createdAt?._seconds || 0;
                    return dateB - dateA;
                  })
                  .slice(0, 3)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={styles.taskItem}
                      style={{
                        backgroundColor: "var(--surface-light)",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--surface-light-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--surface-light)";
                      }}
                    >
                      <div className={styles.taskContent}>
                        {(() => {
                          const normalizedStatus =
                            item.status
                              ?.toLowerCase()
                              .replace(/_/g, " ")
                              .split(" ")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join("")
                              .replace(/\s+/g, "") || "New";
                          const statusClass = `taskStatus${normalizedStatus}`;
                          return (
                            <span
                              className={`${styles.taskStatus} ${styles[statusClass]}`}
                            ></span>
                          );
                        })()}
                        <div className={styles.taskInfo}>
                          <span className={styles.taskTitle}>{item.name}</span>
                          <div className={styles.taskMeta}>
                            <span className={styles.taskType}>{item.type}</span>
                            <span className={styles.taskTime}>
                              {(() => {
                                const date = item.updatedAt || item.createdAt;
                                const isUpdated = !!item.updatedAt;
                                if (!date) return "No date";
                                try {
                                  // Handle Firestore timestamp format
                                  const parsedDate = date._seconds
                                    ? new Date(date._seconds * 1000)
                                    : new Date(date);
                                  if (isNaN(parsedDate.getTime()))
                                    return "Invalid date";

                                  const now = new Date();
                                  const isToday =
                                    parsedDate.toDateString() ===
                                    now.toDateString();

                                  return `${
                                    isUpdated ? "Updated" : "Created"
                                  }: ${
                                    isToday
                                      ? parsedDate.toLocaleTimeString("en-US", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })
                                      : parsedDate.toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                        })
                                  }`;
                                } catch (error) {
                                  return "Invalid date";
                                }
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm" style={{ color: "var(--neutral-600)" }}>
                  No items yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditTeamModal
        isOpen={isEditTeamModalOpen}
        onClose={() => setIsEditTeamModalOpen(false)}
        projectId={projectId || ""}
        currentTeam={teamMembers}
        onTeamUpdate={handleTeamUpdate}
      />

      {selectedMember && (
        <MemberInfoPopup
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};
