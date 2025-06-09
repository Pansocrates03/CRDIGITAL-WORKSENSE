import React from "react";
import styles from "./CreateProject.module.css";
import { ArrowRight } from "lucide-react";
import ProjectDetails from "@/types/ProjectType";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay.tsx";
import { useUser } from "@/hooks/useMembers.ts";
import StatusBadge from "@/components/BacklogTable/StatusBadge";

type ProjectCardProps = {
  project: ProjectDetails;
  handleProjectClick: (id: string) => void;
  isFeatured?: boolean; // Make it optional
};

// Get status color class based on status
const getStatusColorClass = (status: string): string => {
  switch (status) {
    case "active":
      return styles.statusActive;
    case "inactive":
      return styles.statusInactive;
    case "completed":
      return styles.statusCompleted;
    case "on-hold":
      return styles.statusOnHold;
    default:
      return styles.statusActive;
  }
};

const projectCard: React.FC<ProjectCardProps> = ({
  project,
  handleProjectClick,
  isFeatured,
}) => {
  const {
    data: productOwnerDetails,
    isLoading: isOwnerLoading,
    isError: isOwnerError,
    error: ownerError,
  } = useUser(project.ownerId);

  let productOwnerName: string = "Loading...";
  let avatarComponent = null;

  if (isOwnerLoading) {
    productOwnerName = "Loading...";
    avatarComponent = (
      <div
        className={`${styles.avatarPlaceholder} h-6 w-6 rounded-full bg-gray-200 animate-pulse`}
      ></div>
    );
  } else if (isOwnerError) {
    console.error("Error fetching product owner details:", ownerError);
    productOwnerName = "Error fetching owner";
    avatarComponent = (
      <AvatarDisplay
        user={{ name: "Error" }}
        className="h-6 w-6 rounded-full ring-2 ring-white"
      />
    );
  } else if (productOwnerDetails) {
    console.log(productOwnerDetails);
    productOwnerName =
      productOwnerDetails.fullName || productOwnerDetails.name || "N/A"; // Adjust property name
    avatarComponent = (
      <AvatarDisplay
        user={productOwnerDetails}
        className="h-8 w-8 rounded-full ring-2 ring-white"
      />
    );
  }

  return (
    <div
      key={project.id}
      onClick={() => handleProjectClick(project.id)}
      className={`${styles.card} ${isFeatured ? styles.featuredCard : ""}`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleArea}>
          <div className={styles.titleRow}>
            <h4>{project.name}</h4>
            <StatusBadge type="status" value={project.status || "active"} />
          </div>
          <p className={styles.projectInfo}>{project.description}</p>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            {avatarComponent}
            <div className="flex flex-col">
              {" "}
              {/* Use a flex column for name and subtext */}
              <span>{productOwnerName}</span> {/* The name */}
              <p className="text-xs text-gray-500">Product Owner</p>{" "}
              {/* The subtext */}
            </div>
          </div>
        </div>
        <div className={styles.cardAction}>
          <ArrowRight size={18} />
        </div>
      </div>
    </div>
  );
};

export default projectCard;
