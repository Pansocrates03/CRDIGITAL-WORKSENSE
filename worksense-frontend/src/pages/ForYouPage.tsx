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
  const { 
    data: completedTasks = [], 
    isLoading: isLoadingCompleted,
    error: completedError 
  } = useQuery<CompletedTask[]>({
    queryKey: ['completedTasks', projectId, user?.userId],
    queryFn: () => forYouService.getCompletedTasks(user?.userId?.toString() || '', projectId || ''),
    enabled: !!projectId && !!user?.userId
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

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkChange = () => {
    setShowBulkDialog(true);
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
      <h1 className={styles.pageTitle}>For You</h1>
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
                      {assignedItems.slice(0, 3).map((item) => (
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
                    {assignedItems.length > 3 && (
                      <div style={{ marginTop: 12, textAlign: 'center' }}>
                        <Button variant="outline" onClick={() => setShowAllAssigned(true)}>
                          See more
                        </Button>
                      </div>
                    )}
                  </>
                )}
                {selectedItems.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <Button
                      variant="default"
                      onClick={handleBulkChange}
                    >
                      Change State ({selectedItems.length})
                    </Button>
                  </div>
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
                  <div className={styles.backlogItems}>
                    {completedTasks.slice(0, 3).map((task) => {
                      const canEdit = (task as any).id && (task as any).name;
                      return (
                        <div key={task.id} className={styles.backlogItem}>
                          <div className={styles.backlogItemHeader}>
                            <span className={styles.itemType}>Task</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span className={`${styles.itemStatus} ${styles['done']}`}>Done</span>
                              <button
                                style={{ background: 'none', border: 'none', cursor: canEdit ? 'pointer' : 'not-allowed' }}
                                onClick={() => canEdit && setEditItem(task as any)}
                                aria-label="Edit task"
                                disabled={!canEdit}
                              >
                                <MoreVertical size={18} />
                              </button>
                            </div>
                          </div>
                          <h4>{task.name}</h4>
                          <div className={styles.itemMeta}>
                            <span>
                              {task.completedAt && typeof task.completedAt._seconds === 'number'
                                ? `Completed: ${new Date(task.completedAt._seconds * 1000).toLocaleDateString()}`
                                : 'Completed: (No date)'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {activeTab === 'gamification' && (
        <div className={styles.gamificationCard}>
          <p>Gamification features coming soon!</p>
        </div>
      )}

      {/* Bulk state change dialog */}
      <Modal
        isOpen={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        title={`Change State for ${selectedItems.length} items`}
        size="sm"
      >
        <select 
          value={bulkState} 
          onChange={e => setBulkState(e.target.value)} 
          style={{ width: '100%', marginBottom: 16 }}
        >
          <option value="">Select new state</option>
          {allStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        <div className={styles.bulkDialogActions}>
          <Button 
            variant="outline"
            onClick={() => setShowBulkDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={confirmBulkChange}
            disabled={!bulkState || updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? 'Updating...' : 'Confirm'}
          </Button>
        </div>
      </Modal>
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