import React from 'react';
import styles from "../CreateProject.module.css";
import {ArrowLeft, ArrowRight} from "lucide-react";
import ProjectDetails from '@/types/ProjectType';
import {useMembers} from "@/hooks/useMembers.ts";
import { useUser } from "@/hooks/useUsers.ts"
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";
import MemberDetailed from "@/types/MemberDetailedType.ts";

type ProjectCardProps = {
    project: ProjectDetails;
    handleProjectClick: (id: string) => void;
    isFeatured?: boolean; // Make it optional

}


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

const projectCard: React.FC<ProjectCardProps> = ({project, handleProjectClick, isFeatured}) => {

// Corrected Helper function to format date
    const formatDate = (dateInput: Date | string | number | undefined): string => {
        if (!dateInput) return 'N/A';
        try {
            const dateObject = new Date(dateInput); // This will work fine if dateInput is already a Date object
            if (isNaN(dateObject.getTime())) {
                return 'Invalid Date';
            }
            return dateObject.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (e) {
            console.error("Error formatting date:", e);
            return 'Error Date';
        }
    };

    const {
        data: productOwnerDetails,
        isLoading: isOwnerLoading,
        isError: isOwnerError,
        error: ownerError
    } = useUser(project.ownerId);

    const {
        data: members, // Assuming 'members' is an array of user-like objects
        isLoading: isMembersLoading,
        isError: isMembersError,
    } = useMembers(project.id); // Conditional fetching

    let productOwnerName: string = "Loading...";
    let avatarComponent = null; // Initialize a variable to hold the AvatarDisplay or a placeholder

    if (isOwnerLoading) {
        productOwnerName = "Loading...";
        // Optionally, show a loading spinner or skeleton avatar
        avatarComponent =
            <div className={`${styles.avatarPlaceholder} h-6 w-6 rounded-full bg-gray-200 animate-pulse`}></div>;
    } else if (isOwnerError) {
        console.error("Error fetching product owner details:", ownerError);
        productOwnerName = "Error fetching owner";
        // Optionally, show a generic error avatar
        avatarComponent = <AvatarDisplay user={{name: "Error"}} className="h-6 w-6 rounded-full ring-2 ring-white"/>;
    } else if (productOwnerDetails) {
        console.log(productOwnerDetails);
        productOwnerName = productOwnerDetails.fullName || productOwnerDetails.name || "N/A"; // Adjust property name
        // Render AvatarDisplay only when productOwnerDetails is available
        avatarComponent = (
            <AvatarDisplay
                user={productOwnerDetails}
                className="h-8 w-8 rounded-full ring-2 ring-white"
            />
        );
    }

    // --- Member Avatars Display Logic (for featured card) ---
    const MAX_DISPLAY_AVATARS = 3; // Number of member avatars (excluding owner if shown separately)

    const renderMemberAvatarsForFeaturedCard = () => {
        if (isMembersLoading) {
            return (
                <div className={styles.memberAvatars}>
                    {[...Array(MAX_DISPLAY_AVATARS)].map((_, index) => (
                        <div key={`loader-avatar-${index}`}
                             className={`${styles.avatarPlaceholder} ${styles.memberAvatar}  animate-pulse`}></div>
                    ))}
                </div>
            );
        }

        const actualMembers = members?.filter(member => project.ownerId ? member.userId !== project.ownerId : true) || [];

        if (isMembersError || actualMembers.length === 0) {
            if (members && members.length === 1 && productOwnerDetails && members[0].userId === project.ownerId) {
                return <p className="text-xs text-gray-500 mt-1">Owner is the only member.</p>;
            }
            return <p className="text-xs text-gray-500 mt-1">No other team members.</p>;
        }

        const displayableMembers = actualMembers.slice(0, MAX_DISPLAY_AVATARS);
        const remainingMembersCount = actualMembers.length - displayableMembers.length;

        return (
            <div className={styles.memberAvatars}>
                {displayableMembers.map((member: MemberDetailed, index: number) => ( // Use UserLike type
                    <AvatarDisplay
                        key={member.userId || `featured-member-${index}`}
                        user={member.user}
                        className={`h-8 w-8 rounded-full ring-2 ring-white`}

                    />
                ))}
                {remainingMembersCount > 0 && (
                    <div
                        className={`${styles.moreMembers} `}>
                        +{remainingMembersCount}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
            className={`${styles.card} ${isFeatured ? styles.featuredCard : ''}`}

        >
            <div className={styles.cardHeader}>
                <div className={styles.cardTitleArea}>
                    <div className={styles.titleRow}>
                        <h4>{project.name}</h4>
                        <div
                            className={`${styles.status} ${getStatusColorClass(project.status?.toLowerCase() || "active")}`}
                        >
                            {project.status?.toLowerCase() || "active"}
                        </div>
                    </div>
                    <p className={styles.projectInfo}>
                        {project.description}
                    </p>

                    {isFeatured && (
                        <div className={styles.featuredDetailsSection}>
                            {project.startDate && (
                                <div className={styles.detailItem}>
                                    <ArrowRight size={22} className={styles.detailIcon}/>
                                    <span>Start date: {formatDate(project.startDate)}</span>
                                </div>
                            )}
                            {project.endDate && (
                                <div className={styles.detailItem}>
                                    <ArrowLeft size={22}
                                               className={styles.detailIcon} /* Consider a different icon for updated if desired */ />
                                    <span>End date: {formatDate(project.endDate)}</span>
                                </div>
                            )}
                            <div className={styles.detailItem}> {/* Using detailItem for consistent layout */}

                                <div className="flex flex-col">
                                    <span className="pt-1">Team</span>
                                    {renderMemberAvatarsForFeaturedCard()}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.metaInfo}>

                    <div className={styles.metaItem}>
                        {avatarComponent}
                        <div className="flex flex-col"> {/* Use a flex column for name and subtext */}
                            <span>{productOwnerName}</span> {/* The name */}
                            <p className="text-xs text-gray-500">Product Owner</p> {/* The subtext */}
                        </div>
                    </div>
                </div>
                <div className={styles.cardAction}>
                    <ArrowRight size={18}/>
                </div>
            </div>
        </div>
    )
};

export default projectCard;