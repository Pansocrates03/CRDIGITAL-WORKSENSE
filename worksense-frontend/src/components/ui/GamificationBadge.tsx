import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient.ts";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

// Badge icon mapping
const getBadgeIcon = (badgeName: string, isLatest: boolean = false) => {
  const iconClass = `w-4 h-4 ${
    isLatest ? "text-[var(--accent-pink)]" : "text-[var(--accent-blue)]"
  }`;

  // Map badge names to their corresponding Lucide icons
  const iconMap: Record<string, LucideIcon> = {
    "First Steps": LucideIcons.Rocket,
    "Getting Started": LucideIcons.Star,
    "Rising Star": LucideIcons.TrendingUp,
    Productive: LucideIcons.Award,
    Expert: LucideIcons.ShieldCheck,
    Master: LucideIcons.Crown,
  };

  const IconComponent = iconMap[badgeName] || LucideIcons.Trophy;
  return <IconComponent className={iconClass} />;
};

interface GamificationBadgeProps {
  projectId?: string;
}

const GamificationBadge: React.FC<GamificationBadgeProps> = ({ projectId }) => {
  const { user } = useAuth();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-profile-with-gamification", projectId],
    queryFn: async () => {
      const response = await apiClient.get("/me", {
        params: { projectId },
      });
      return response.data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] animate-pulse"
        style={{ backgroundColor: "var(--neutral-200)" }}
      >
        <div
          className="w-16 h-4 rounded"
          style={{ backgroundColor: "var(--neutral-300)" }}
        ></div>
        <div
          className="w-8 h-4 rounded"
          style={{ backgroundColor: "var(--neutral-300)" }}
        ></div>
      </div>
    );
  }

  if (!profileData?.gamification || !user) {
    return null;
  }

  const { totalPoints, projectPoints, level, badges } =
    profileData.gamification;
  const displayPoints = projectId ? projectPoints : totalPoints;
  const latestBadge = badges[badges.length - 1];
  const nextBadgePoints = getNextBadgePoints(displayPoints);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] transition-all duration-200 cursor-pointer group hover:scale-105"
            style={{
              backgroundColor: "var(--surface-light)",
              border: "1px solid var(--surface-light-border)",
              boxShadow: "var(--shadow-sm)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
          >
            {/* Latest Badge Icon */}
            {latestBadge && (
              <div className="group-hover:scale-110 transition-transform duration-200">
                {getBadgeIcon(latestBadge.name, true)}
              </div>
            )}

            {/* Points with Zap Icon */}
            <div className="flex items-center gap-1">
              <LucideIcons.Zap
                className="w-3.5 h-3.5"
                style={{ color: "var(--accent-pink)" }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {displayPoints}
              </span>
            </div>

            {/* Level Badge */}
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 h-5 font-semibold transition-colors"
              style={{
                backgroundColor: "var(--accent-blue)",
                color: "var(--accent-blue-text)",
                border: "none",
              }}
            >
              Lv.{level}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="p-4 max-w-xs rounded-[var(--radius)]"
          style={{
            backgroundColor: "var(--background-primary)",
            border: "1px solid var(--surface-light-border)",
            boxShadow: "var(--shadow-lg)",
            color: "var(--text-primary)",
          }}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: "var(--accent-pink-light)" }}
              >
                {latestBadge ? (
                  getBadgeIcon(latestBadge.name, true)
                ) : (
                  <LucideIcons.Trophy
                    className="w-5 h-5"
                    style={{ color: "var(--accent-pink)" }}
                  />
                )}
              </div>
              <div>
                <p
                  className="font-bold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  Level {level}
                </p>
                <p className="text-sm" style={{ color: "var(--neutral-600)" }}>
                  {projectId ? (
                    <>
                      <span>{projectPoints} project points</span>
                      <br />
                      <span>{totalPoints} total points</span>
                    </>
                  ) : (
                    `${totalPoints} total points`
                  )}
                </p>
              </div>
            </div>

            {/* Latest Achievement */}
            {latestBadge && (
              <div
                className="rounded-[var(--radius)] p-3"
                style={{
                  backgroundColor: "var(--accent-pink-light)",
                  border: "1px solid var(--surface-light-border)",
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--accent-pink)" }}
                >
                  Latest Achievement
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getBadgeIcon(latestBadge.name)}
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {latestBadge.name}
                  </span>
                </div>
              </div>
            )}

            {/* All Badges */}
            {badges.length > 0 && (
              <div>
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Badges Earned ({badges.length})
                </p>
                <div className="flex gap-2 flex-wrap">
                  {badges.map((badge, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center w-8 h-8 rounded-full hover:scale-110 transition-transform cursor-help"
                      style={{ backgroundColor: "var(--surface-light)" }}
                      title={badge.name}
                    >
                      {getBadgeIcon(badge.name)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress to Next Badge */}
            <div
              className="pt-2"
              style={{ borderTop: "1px solid var(--surface-light-border)" }}
            >
              <div className="flex items-center gap-2">
                <LucideIcons.Target
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--accent-blue)" }}
                />
                <p className="text-xs" style={{ color: "var(--neutral-600)" }}>
                  {nextBadgePoints > 0
                    ? `${nextBadgePoints} points to next badge`
                    : "All badges earned! You're amazing!"}
                </p>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const getNextBadgePoints = (currentPoints: number): number => {
  const badgeThresholds = [250, 500, 1000];

  for (const threshold of badgeThresholds) {
    if (currentPoints < threshold) {
      return threshold - currentPoints;
    }
  }

  return 0;
};

export default GamificationBadge;
