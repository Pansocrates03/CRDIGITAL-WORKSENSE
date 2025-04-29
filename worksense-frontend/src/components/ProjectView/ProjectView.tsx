// Core Imports
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../api/apiClient";
import styles from "./ProjectView.module.css";
// Component Imports
import LoadingSpinner from "../Loading/LoadingSpinner";
import EditTeamModal from "../EditTeamModal/EditTeamModal";
import MemberInfoPopup from "../MemberInfoPopup/MemberInfoPopup";
// Type Imports
import ProjectDetails from "@/types/ProjectType";
import MemberDetailed from "@/types/MemberDetailedType";

import { Avatar } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

type FullProjectData = {
  project: ProjectDetails;
  members: MemberDetailed[];
};

export const ProjectView: React.FC<FullProjectData> = ({
  project,
  members,
}) => {
  const { id } = useParams<{ id: string }>();
  const [backlogItems, setBacklogItems] = useState<BacklogItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<MemberDetailed[]>(members);
  const [selectedMember, setSelectedMember] = useState<MemberDetailed | null>(null);

  useEffect(() => {
    const fetchBacklogItems = async () => {
      try {
        const response = await apiClient.get(`/projects/${id}/items`);
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
              {/*project.team[0].name*/}
              Esteban
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
            <button
              className={styles.editButton}
              onClick={() => setIsEditTeamModalOpen(true)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5 2.5L13.5 4.5M12.5 1.5L8 6L7 9L10 8L14.5 3.5C14.8978 3.10217 15.1213 2.56261 15.1213 2C15.1213 1.43739 14.8978 0.897825 14.5 0.5C14.1022 0.102175 13.5626 -0.121281 13 -0.121281C12.4374 -0.121281 11.8978 0.102175 11.5 0.5L12.5 1.5ZM2 3H6M2 7H8M2 11H14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Edit Team
            </button>
          </div>
          <div className={styles.teamAvatars}>
            {members.map((m) => (
              <div
                key={m.userId}
                className={styles.avatar}
                onClick={(e) => handleAvatarClick(m, e)}
              >
                <Avatar>
                  <AvatarImage src={m.profilePicture} />
                  {/* <AvatarFallback delayMs={600}> */}
                </Avatar>
                <span className={styles.avatarName}>{m.name}</span>
              </div>
            ))}
          </div>

          <div className={styles.teamStats}>
            <h3>Project Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {backlogItems.length}
                  <span className={styles.statLabel}>Total Tasks</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {backlogItems.filter((item) => item.type === "epic").length}
                  <span className={styles.statLabel}>Epics</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {
                    backlogItems.filter((item) => item.status === "in-progress")
                      .length
                  }
                  <span className={styles.statLabel}>In Progress</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {backlogItems.filter((item) => item.status === "done").length}
                  <span className={styles.statLabel}>Completed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Backlog Preview Section */}
        <section className={styles.backlogPreview}>
          <h2>Recent Backlog Items</h2>
          {loading ? (
            <LoadingSpinner text="Loading backlog items..." />
          ) : (
            <div className={styles.backlogItems}>
              {backlogItems.slice(0, 5).map((item) => (
                <div key={item.id} className={styles.backlogItem}>
                  <div className={styles.backlogItemHeader}>
                    <span className={styles.itemType}>{item.type}</span>
                    <span
                      className={`${styles.itemStatus} ${styles[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  <div className={styles.itemMeta}>
                    <span>Priority: {item.priority}</span>
                    {item.size !== undefined && item.size > 0 && (
                      <span>Size: {item.size}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <EditTeamModal
        isOpen={isEditTeamModalOpen}
        onClose={() => setIsEditTeamModalOpen(false)}
        projectId={id || ''}
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
