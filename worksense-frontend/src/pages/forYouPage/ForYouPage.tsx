import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import styles from './ForYouPage.module.css';
import { forYouService, AssignedItem, CompletedTask, PersonalGamificationInfo } from '@/services/forYouService';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal/Modal';
import UpdateItemModal from '@/components/BacklogTable/UpdateItemModal';
import { MoreVertical, Award, Star, Rocket, Pencil } from 'lucide-react';
import ForYouGamificationSummaryBar from '@/components/forYou/ForYouGamificationSummaryBar';
import ForYouGamificationOnboarding from '@/components/forYou/ForYouGamificationOnboarding';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ProjectLeaderboard from '@/components/ui/ProjectLeaderboard';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import ForYouGamificationDetails from '@/components/forYou/ForYouGamificationDetails';
import AssignedItemsList from '@/components/forYou/AssignedItemsList';
import CompletedItemsList from '@/components/forYou/CompletedItemsList';
import YourContributionsCard from '@/components/forYou/YourContributionsCard';

const iconMap: Record<string, React.ElementType> = {
  Award,
  Star,
  Rocket,
};

function getInitials(name: string) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const ForYouPage = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { profile: userProfile } = useUserProfile();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showAllAssigned, setShowAllAssigned] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [editItem, setEditItem] = useState<AssignedItem | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch assigned items
  const {
    data: assignedItems = [],
    isLoading: isLoadingAssigned,
    error: assignedError
  } = useQuery<AssignedItem[]>({
    queryKey: ['assignedItems', projectId, user?.userId],
    queryFn: () => forYouService.getAssignedItems(user?.userId?.toString() || '', projectId || ''),
    enabled: !!projectId && !!user?.userId
  });

  // Fetch completed tasks
  const userIdString = user?.userId ? user.userId.toString() : '';
  const {
    data: completedTasks = [],
    isLoading: isLoadingCompleted,
    error: completedError
  } = useQuery<CompletedTask[]>({
    queryKey: ['completedTasks', projectId, userIdString, showAllCompleted],
    queryFn: () => forYouService.getCompletedTasks(
      userIdString,
      projectId || '',
      showAllCompleted ? 100 : 3
    ),
    enabled: !!projectId && !!userIdString
  });

  // Fetch personal gamification info
  const {
    data: gamification,
    isLoading: isLoadingGamification,
    isError: isErrorGamification,
    refetch: refetchGamification
  } = useQuery<PersonalGamificationInfo>({
    queryKey: ['personalGamification', projectId, userIdString],
    queryFn: () => forYouService.getPersonalGamificationInfo(userIdString, projectId || ''),
    enabled: !!projectId && !!userIdString
  });

  // Fetch leaderboard data for contributions card
  const { data: leaderboardData } = useReactQuery({
    queryKey: ['project-leaderboard', projectId],
    queryFn: async () => {
      const response = await import('@/api/apiClient').then(m => m.default.get(`/projects/${projectId}/gamification/leaderboard`));
      return response.data;
    },
    enabled: !!projectId,
    refetchInterval: 60000
  });

  // Onboarding modal logic
  useEffect(() => {
    if (gamification && (!gamification.profilePicture || !gamification.personalPhrase)) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [gamification]);

  const updateMutation = useMutation({
    mutationFn: (data: { profilePicture: string; personalPhrase: string }) =>
      forYouService.updatePersonalGamificationInfo(userIdString, projectId || '', data),
    onSuccess: () => {
      toast.success('Profile updated!');
      setShowOnboarding(false);
      refetchGamification();
    },
    onError: () => {
      toast.error('Failed to update profile.');
    },
  });

  // Update item status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ itemId, newStatus }: { itemId: string; newStatus: string }) =>
      forYouService.updateItemStatus(itemId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignedItems'] });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  });

  if (isLoadingAssigned || isLoadingCompleted || isLoadingGamification) {
    return (
      <div className={styles.forYouContainer}>
        <LoadingSpinner text="Loading your dashboard..." />
      </div>
    );
  }

  if (assignedError || completedError || isErrorGamification) {
    return (
      <div className={styles.forYouContainer}>
        <div className={styles.errorMessage}>
          <h2>Error Loading Data</h2>
          <p>Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.forYouContainer}>
      {/* Page Title and Description */}
      <h1 className={styles.pageTitle}>For <span className="text-[var(--accent-pink)]/80">You</span></h1>
      <p className={styles.pageDescription}>A personalized dashboard with your assigned items, completed tasks, and gamification features.</p>
      {/* Gamification summary bar */}
      {gamification && (
        <ForYouGamificationSummaryBar
          name={gamification.name}
          points={gamification.points}
          profilePicture={gamification.profilePicture || userProfile?.avatar}
          dropdownOpen={dropdownOpen}
          onToggleDropdown={() => setDropdownOpen((v) => !v)}
        />
      )}
      {/* Onboarding Modal */}
      <ForYouGamificationOnboarding
        open={showOnboarding}
        onComplete={(data) => updateMutation.mutate(data)}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Dropdown section */}
      {gamification && dropdownOpen && (
        <ForYouGamificationDetails
          gamification={gamification}
          userProfile={userProfile || undefined}
          onEdit={() => setShowOnboarding(true)}
          projectId={projectId || ''}
        />
      )}

      {/* Three-column layout */}
      <div className={styles.sections}>
        {/* Assigned Items */}
        <div className={styles.column}>
          <AssignedItemsList assignedItems={assignedItems} projectId={projectId || ''} queryClient={queryClient} />
        </div>
        {/* Completed Items */}
        <div className={styles.column}>
          <CompletedItemsList completedTasks={completedTasks} projectId={projectId || ''} queryClient={queryClient} />
        </div>
        {/* Your Contributions */}
        <div className={styles.column}>
          <YourContributionsCard
            assignedCount={assignedItems.length}
            completedCount={completedTasks.length}
            leaderboardData={leaderboardData}
            userId={user?.userId}
          />
        </div>
      </div>
      <UpdateItemModal
        projectId={projectId || ''}
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        onItemUpdated={() => {
          setEditItem(null);
          queryClient.invalidateQueries({ queryKey: ['assignedItems'] });
          queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
        }}
        item={editItem as any}
      />
    </div>
  );
};

export default ForYouPage; 