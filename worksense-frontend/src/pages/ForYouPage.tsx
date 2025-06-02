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
import ForYouGamificationSummary from '@/components/forYou/ForYouGamificationSummary';
import ForYouGamificationOnboarding from '@/components/forYou/ForYouGamificationOnboarding';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ProjectLeaderboard from '@/components/ui/ProjectLeaderboard';
import { useQuery as useReactQuery } from '@tanstack/react-query';

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
        <div
          className="w-full border-b border-neutral-200 bg-white flex items-center justify-between px-6 py-3 cursor-pointer shadow-sm rounded-xl"
          onClick={() => setDropdownOpen((v) => !v)}
          style={{ minHeight: 64 }}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={typeof (gamification.profilePicture || userProfile?.avatar) === 'string' && (gamification.profilePicture || userProfile?.avatar) ? (gamification.profilePicture || userProfile?.avatar) : undefined} alt="Profile" />
              <AvatarFallback>{getInitials(gamification.name)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-lg text-foreground">{gamification.name}</span>
            <span className="text-[var(--accent-pink)] font-bold text-lg">{gamification.points} pts</span>
          </div>
          <span className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg></span>
        </div>
      )}
      {/* Dropdown section */}
      {gamification && dropdownOpen && (
        <div className="w-full bg-white border-b border-neutral-200 px-8 py-8 flex flex-row items-center gap-8 shadow-sm rounded-b-xl flex-wrap md:flex-nowrap">
          {/* Avatar with edit button on hover */}
          <div className="flex-shrink-0 flex justify-center w-full md:w-auto mb-4 md:mb-0 relative group">
            <Avatar className="h-24 w-24">
              <AvatarImage src={typeof (gamification.profilePicture || userProfile?.avatar) === 'string' && (gamification.profilePicture || userProfile?.avatar) ? (gamification.profilePicture || userProfile?.avatar) : undefined} alt="Profile" />
              <AvatarFallback>{getInitials(gamification.name)}</AvatarFallback>
            </Avatar>
            <button
              className="absolute bottom-2 right-2 bg-white border border-neutral-200 rounded-full p-2 shadow transition-opacity opacity-0 group-hover:opacity-100 hover:bg-[var(--accent-pink-light)]"
              style={{ zIndex: 2 }}
              onClick={e => { e.stopPropagation(); setShowOnboarding(true); }}
              type="button"
              aria-label="Edit profile picture"
            >
              <Pencil className="w-5 h-5 text-[var(--accent-pink)]" />
            </button>
          </div>
          {/* Center: Main Info + Leaderboard */}
          <div className="flex-1 min-w-[200px] flex flex-col md:flex-row items-center md:items-stretch gap-8">
            {/* Main Info */}
            <div className="flex flex-col items-center md:items-start gap-2 flex-1">
              <div className="font-bold text-2xl md:text-xl text-center md:text-left">{gamification.name}</div>
              <div className="text-2xl font-bold text-[var(--accent-pink)] text-center md:text-left">{gamification.points} pts</div>
              <div className="mt-2 w-full flex flex-col items-center md:items-start">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1 text-center md:text-left">
                  <span>Personal Phrase</span>
                  <button
                    className="p-1 rounded-full hover:bg-[var(--accent-pink-light)]"
                    onClick={e => { e.stopPropagation(); setShowOnboarding(true); }}
                    type="button"
                    aria-label="Edit personal phrase"
                  >
                    <Pencil className="w-4 h-4 text-[var(--accent-pink)]" />
                  </button>
                </div>
                <div className="text-base font-medium text-center md:text-left">{gamification.personalPhrase || <span className="italic text-muted-foreground">No phrase set</span>}</div>
              </div>
            </div>
            {/* Divider */}
            <div className="hidden md:block w-px bg-neutral-200 mx-4" />
            {/* Leaderboard */}
            <div className="flex flex-col items-center justify-center flex-1 min-w-[180px]">
              <ProjectLeaderboard projectId={projectId || ''} compact={true} maxEntries={3} />
            </div>
          </div>
          {/* Badges */}
          <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
            <div className="w-full md:w-auto">
              <div className="text-muted-foreground text-xs mb-2 text-center md:text-right">Badges</div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-end">
                {gamification.badges.length === 0 ? (
                  <span className="text-muted-foreground">No badges yet.</span>
                ) : (
                  gamification.badges.map((badge, idx) => {
                    const LucideIcon = iconMap[badge.icon] || Award;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="bg-[var(--accent-pink-light)] rounded-full p-2 mb-1">
                          <LucideIcon className="w-7 h-7 text-[var(--accent-pink)]" />
                        </span>
                        <span className="text-xs font-medium">{badge.name}</span>
                        <span className="text-[10px] text-muted-foreground">+{badge.points}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Onboarding Modal */}
      <ForYouGamificationOnboarding
        open={showOnboarding}
        onComplete={(data) => updateMutation.mutate(data)}
      />

      {/* Three-column layout */}
      <div className={styles.sections}>
        {/* Assigned Items */}
        <div className={styles.column}>
          <Card>
            <CardHeader>
              <CardTitle>Assigned Items</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedItems.length === 0 ? (
                <div className={styles.emptyState}>No items assigned to you yet.</div>
              ) : (
                <>
                  <div className={styles.backlogItems}>
                    {(showAllAssigned ? assignedItems : assignedItems.slice(0, 3)).map((item) => (
                      <div key={item.id} className={styles.backlogItem}>
                        <div className={styles.backlogItemHeader}>
                          <span className={styles.itemType}>{item.type}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={`${styles.itemStatus} ${styles[item.status?.toLowerCase() || '']}`}>{item.status}</span>
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                              onClick={() => setEditItem(item)}
                              aria-label="Edit item"
                            >
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </div>
                        <h4>{item.name}</h4>
                        {item.description && <p>{item.description}</p>}
                        <div className={styles.itemMeta}>
                          <span>Priority: {item.priority || '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {assignedItems.length > 3 && !showAllAssigned && (
                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                      <Button variant="outline" onClick={() => setShowAllAssigned(true)}>
                        See more
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          <Modal
            isOpen={showAllAssigned}
            onClose={() => setShowAllAssigned(false)}
            title="All Assigned Items"
            size="l"
          >
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className={styles.backlogItems}>
                {assignedItems.map((item) => (
                  <div key={item.id} className={styles.backlogItem}>
                    <div className={styles.backlogItemHeader}>
                      <span className={styles.itemType}>{item.type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`${styles.itemStatus} ${styles[item.status?.toLowerCase() || '']}`}>{item.status}</span>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          onClick={() => setEditItem(item)}
                          aria-label="Edit item"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                    <h4>{item.name}</h4>
                    {item.description && <p>{item.description}</p>}
                    <div className={styles.itemMeta}>
                      <span>Priority: {item.priority || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
          <UpdateItemModal
            projectId={projectId || ''}
            isOpen={!!editItem}
            onClose={() => setEditItem(null)}
            onItemUpdated={() => {
              setEditItem(null);
              queryClient.invalidateQueries({ queryKey: ['assignedItems'] });
            }}
            item={editItem as any}
          />
        </div>
        {/* Completed Items */}
        <div className={styles.column}>
          <Card>
            <CardHeader>
              <CardTitle>Completed Items</CardTitle>
            </CardHeader>
            <CardContent>
              {completedTasks.length === 0 ? (
                <div className={styles.emptyState}>No completed tasks yet.</div>
              ) : (
                <>
                  <div className={styles.backlogItems} style={{ maxHeight: 'none', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem' }} >
                    {(showAllCompleted ? completedTasks : completedTasks.slice(0, 3)).map((item) => {
                      const canEdit = (item as any).id && (item as any).name;
                      return (
                        <div key={item.id} className={styles.backlogItem}>
                          <div className={styles.backlogItemHeader}>
                            <span className={styles.itemType}>{item.type}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span className={`${styles.itemStatus} ${styles['done']}`}>Done</span>
                              <button
                                style={{ background: 'none', border: 'none', cursor: canEdit ? 'pointer' : 'not-allowed' }}
                                onClick={() => canEdit && setEditItem(item as any)}
                                aria-label="Edit task"
                                disabled={!canEdit}
                              >
                                <MoreVertical size={18} />
                              </button>
                            </div>
                          </div>
                          <h4>{item.name}</h4>
                          {item.description && <p>{item.description}</p>}
                          <div className={styles.itemMeta}>
                            <span>Priority: {item.priority || '—'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {completedTasks.length > 3 && !showAllCompleted && (
                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                      <Button 
                        variant="outline" 
                        onClick={() => {setShowAllCompleted(true);}}>
                        See more
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          <Modal
            isOpen={showAllCompleted}
            onClose={() => setShowAllCompleted(false)}
            title="All Completed Items"
            size="l"
          >
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className={styles.backlogItems} style={{ maxHeight: 'none', overflow: 'visible', display: 'block' }}>
                {completedTasks.map((item) => (
                  <div key={item.id} className={styles.backlogItem}>
                    <div className={styles.backlogItemHeader}>
                      <span className={styles.itemType}>{item.type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`${styles.itemStatus} ${styles['done']}`}>Done</span>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          onClick={() => setEditItem(item)}
                          aria-label="Edit item"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                    <h4>{item.name}</h4>
                    {item.description && <p>{item.description}</p>}
                    <div className={styles.itemMeta}>
                      <span>Priority: {item.priority || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        </div>
        {/* Your Contributions */}
        <div className={styles.column}>
          <Card>
            <CardHeader>
              <CardTitle>Your contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 items-center justify-center py-2">
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-2xl font-bold text-[var(--accent-pink)]">{assignedItems.length}</span>
                  <span className="text-sm text-muted-foreground">Tasks Assigned</span>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-2xl font-bold text-[var(--accent-pink)]">{completedTasks.length}</span>
                  <span className="text-sm text-muted-foreground">Tasks Completed</span>
                </div>
                {/* Leaderboard standing */}
                {(() => {
                  if (!leaderboardData || !user) return null;
                  const userEntry = leaderboardData.find((entry: any) => entry.userId === user.userId);
                  if (!userEntry) return null;
                  const rank = userEntry.rank;
                  let message = '';
                  if (rank === 1) message = "Congratulations! You're leading the board! 🏆";
                  else if (rank === 2) message = "Great job! You're in 2nd place—keep pushing for the top!";
                  else if (rank === 3) message = "Nice work! You're in 3rd place—aim higher!";
                  else message = "Keep going! Every contribution counts.";
                  return (
                    <div className="flex flex-col gap-1 items-center mt-2">
                      <span className="text-lg font-semibold">Leaderboard Standing: <span className="text-[var(--accent-pink)]">#{rank}</span></span>
                      <span className="text-sm text-muted-foreground text-center">{message}</span>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
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