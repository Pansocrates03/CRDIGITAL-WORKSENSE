import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import styles from './ForYouPage.module.css';
import { forYouService, AssignedItem, CompletedTask } from '@/services/forYouService';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import Modal from '@/components/Modal/Modal';
import { Button } from '@/components/ui/button';
import UpdateItemModal from '@/components/BacklogTable/UpdateItemModal';
import { MoreVertical } from 'lucide-react';

const allStates = ['New', 'To Do', 'In Progress', 'In Review', 'Done'];
const bulkTypes = ['story', 'bug', 'task', 'knowledge'];

const ForYouPage = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkState, setBulkState] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'gamification'>('general');
  const [showAllAssigned, setShowAllAssigned] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [editItem, setEditItem] = useState<AssignedItem | null>(null);

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
  if (!userIdString) {
    console.warn('ForYouPage: userId is missing, completed tasks query will not run.');
  }
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

  console.log('Completed Tasks:', completedTasks);
  console.log('Number of completed tasks:', completedTasks.length);
  console.log('Show all completed:', showAllCompleted);
  console.log('Should show see more:', completedTasks.length > 3 && !showAllCompleted);

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

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };



  const confirmBulkChange = async () => {
    if (!bulkState) return;

    try {
      // Update each selected item
      await Promise.all(
        selectedItems.map(itemId =>
          updateStatusMutation.mutateAsync({ itemId, newStatus: bulkState })
        )
      );

      setShowBulkDialog(false);
      setSelectedItems([]);
      setBulkState('');
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast.error('Failed to update some items');
    }
  };

  if (isLoadingAssigned || isLoadingCompleted) {
    return (
      <div className={styles.forYouContainer}>
        <LoadingSpinner text="Loading your items..." />
      </div>
    );
  }

  if (assignedError || completedError) {
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
      <h1 className={styles.pageTitle}>For <span className={"text-[var(--accent-pink)]/80"}>You</span></h1>
      <p className={styles.pageDescription}>A personalized dashboard with your assigned items, completed tasks, and gamification features.</p>
      
      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={activeTab === 'general' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setActiveTab('general')}
        >
          General Info
        </button>
        <button
          className={activeTab === 'gamification' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setActiveTab('gamification')}
        >
          Gamification
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className={styles.sections}>
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
                    <div className={styles.backlogItems} style={{ maxHeight: 'none', overflow: 'visible', display: 'block' }}>
                      {(showAllCompleted ? completedTasks : completedTasks.slice(0, 3)).map((item) => {
                        const canEdit = (item as any).id && (item as any).name;
                        return (
                          <div key={item.id} className={styles.backlogItem}>
                            <div className={styles.backlogItemHeader}>
                              <span className={styles.itemType}>{item.parentType ? `${item.parentType} Subitem` : `${item.type}`}</span>
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
        </div>
      )}
      {activeTab === 'gamification' && (
        <div className={styles.gamificationCard}>
          <p>Gamification features coming soon!</p>
        </div>
      )}
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