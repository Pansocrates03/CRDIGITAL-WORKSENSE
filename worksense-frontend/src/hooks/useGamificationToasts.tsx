import { useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, Award, Crown, Star } from "lucide-react";

interface ToastData {
  type: "success";
  points: number;
  newBadges: Array<{
    name: string;
    points: number;
    icon: string;
    earnedAt: string;
  }>;
  totalPoints: number;
  level: number;
}

export const useGamificationToasts = () => {
  const { user } = useAuth();

  const showGamificationToast = useCallback(
    (toastData: ToastData) => {
      console.log("Toast Data Received:", {
        user: user?.email,
        points: toastData?.points,
        newBadges: toastData?.newBadges?.length,
        totalPoints: toastData?.totalPoints,
        level: toastData?.level,
      });

      if (!toastData || !user) {
        console.log("Toast not shown - Missing data:", {
          hasToastData: !!toastData,
          hasUser: !!user,
        });
        return;
      }

      const { points, newBadges, totalPoints, level } = toastData;

      // Show points earned toast
      if (points > 0) {
        console.log("Showing points toast:", { points, totalPoints });
        toast.custom(
          (t) => (
            <div
              className="flex items-center gap-3 p-4 rounded-xl shadow-lg border max-w-sm"
              style={{
                background: "var(--background-primary)",
                borderColor: "var(--accent-pink)",
                color: "var(--text-primary)",
              }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: "var(--accent-pink)" }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p
                  className="font-semibold text-sm"
                  style={{ color: "var(--accent-pink)" }}
                >
                  +{points} Points Earned!
                </p>
                <p className="text-xs" style={{ color: "var(--neutral-600)" }}>
                  Total: {totalPoints} points
                </p>
              </div>
            </div>
          ),
          {
            duration: 3000,
            position: "bottom-right",
          }
        );
      }

      // Show badge earned toasts
      if (newBadges?.length > 0) {
        console.log("Showing badge toasts:", { badges: newBadges });
        newBadges.forEach((badge, index) => {
          setTimeout(() => {
            console.log("Showing badge toast:", { badge, index });
            toast.custom(
              (t) => (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl shadow-lg border-0 max-w-sm text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent-pink), var(--accent-pink-hover))",
                    boxShadow: "0 8px 24px rgba(172, 23, 84, 0.3)",
                  }}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20">
                    <Award className="w-5 h-5 text-[var(--accent-pink)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">New Badge Earned!</p>
                    <p className="text-xs opacity-90">{badge.name}</p>
                  </div>
                </div>
              ),
              {
                duration: 4000,
                position: "bottom-right",
              }
            );
          }, (index + 1) * 600);
        });
      }

      // Show level up toast
      if (level > 1 && points > 0) {
        const pointsForLevel = level * 100;
        const pointsForPreviousLevel = (level - 1) * 100;
        const shouldShowLevelUp =
          totalPoints - points < pointsForLevel &&
          totalPoints >= pointsForLevel;

        console.log("Level up check:", {
          level,
          points,
          totalPoints,
          pointsForLevel,
          pointsForPreviousLevel,
          shouldShowLevelUp,
        });

        if (shouldShowLevelUp) {
          setTimeout(() => {
            console.log("Showing level up toast");
            toast.custom(
              (t) => (
                <div
                  className="flex items-center gap-4 p-5 rounded-xl shadow-xl border-0 max-w-sm text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent-blue), var(--accent-blue-hover))",
                    boxShadow: "0 12px 32px rgba(23, 106, 172, 0.4)",
                  }}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-20">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base">Level Up!</p>
                    <p className="text-sm opacity-90">
                      You're now Level {level}
                    </p>
                  </div>
                </div>
              ),
              {
                duration: 5000,
                position: "bottom-center",
              }
            );
          }, 1200);
        }
      }
    },
    [user]
  );

  return { showGamificationToast };
};
