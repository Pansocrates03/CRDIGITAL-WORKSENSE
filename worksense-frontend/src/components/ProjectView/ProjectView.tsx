// Core Imports
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProjectView.module.css";
import apiClient from "@/api/apiClient";
// Component Imports
import EditTeamModal from "../EditTeamModal/EditTeamModal";
import MemberInfoPopup from "../MemberInfoPopup/MemberInfoPopup";
// Type Imports
import ProjectDetails from "@/types/ProjectType";
import MemberDetailed from "@/types/MemberDetailedType";

import { AvatarDisplay } from "../ui/AvatarDisplay";

import RecentBacklogItems from "./RecentBacklogItems";

type FullProjectData = {
  project: ProjectDetails;
  members: MemberDetailed[];
};

export const ProjectView: React.FC<FullProjectData> = ({
  project,
  members,
}) => {
  const { id } = useParams<{ id: string }>();

  const [backlogItems, setBacklogItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<MemberDetailed[]>(members);
  const [selectedMember, setSelectedMember] = useState<MemberDetailed | null>(
    null
  );

  useEffect(() => {
    const fetchBacklogItems = async () => {
      try {
        const response = await apiClient.get(`/projects/${id}/backlog/items`);
        const items = response.data;
        setBacklogItems(items);
      } catch (error) {
        console.error("Error fetching backlog items:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBacklogItems();
    }
  }, [id]);

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
      (members) => members.userId === projectDetails.ownerId
    );
    return owner?.name;
  };

  return (
    <div className={styles.projectView}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.projectIcon}>
          <span>{project.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className={styles.projectInfo}>
          <h1>{project.name}</h1>
          <div className={styles.projectMeta}>
            <span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                  fill="currentColor"
                />
                <path
                  d="M8 9C5.23858 9 3 11.2386 3 14H13C13 11.2386 10.7614 9 8 9Z"
                  fill="currentColor"
                />
              </svg>
              {getOwnerName(project, members)}
            </span>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className={styles.aboutSection}>
        <h2>About the project</h2>
        <p>{project.description}</p>
      </section>

      <div className={styles.mainContent}>
        {/* Team Section */}
        <section className={styles.teamSection}>
          <div className={styles.sectionHeader}>
            <h2>Project Team</h2>
          </div>
          <div className={styles.teamAvatars}>
            {members.map((m) => (
              <div
                key={m.userId}
                className={styles.avatar}
                onClick={(e) => handleAvatarClick(m, e)}
              >
                <AvatarDisplay
                  user={{
                    name: m.name,
                    profilePicture: m.profilePicture,
                  }}
                  size="lg"
                />
                <span className={styles.avatarName}>{m.name}</span>
              </div>
            ))}
          </div>

          <div className={styles.teamStats}>
            <h3>Project Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {backlogItems?.length}
                  <span className={styles.statLabel}>Total Tasks</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {
                    backlogItems?.filter((item: any) => item.type === "epic")
                      .length
                  }
                  <span className={styles.statLabel}>Epics</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {
                    backlogItems?.filter(
                      (item: any) => item.status === "in-progress"
                    ).length
                  }
                  <span className={styles.statLabel}>In Progress</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {
                    backlogItems?.filter((item: any) => item.status === "done")
                      .length
                  }
                  <span className={styles.statLabel}>Completed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Backlog Preview Section */}
        <RecentBacklogItems isloading={loading} items={backlogItems} />
      </div>

      <EditTeamModal
        isOpen={isEditTeamModalOpen}
        onClose={() => setIsEditTeamModalOpen(false)}
        projectId={id || ""}
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
