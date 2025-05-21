import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import styles from './ForYouPage.module.css';
import { forYouService, AssignedItem, CompletedTask } from '@/services/forYouService';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';

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
          {/* Main dashboard column */}
          <div className={styles.leftCol}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Assigned Items</h2>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.checkboxCell}></th>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedItems.map((item) => (
                      <tr key={item.id}>
                        <td className={styles.checkboxCell}>
                          {bulkTypes.includes(item.type) && (
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                            />
                          )}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{item.type}</td>
                        <td>{item.name}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedItems.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <button
                    className={styles.bulkButton}
                    onClick={handleBulkChange}
                  >
                    Change State ({selectedItems.length})
                  </button>
                </div>
              )}
            </div>

            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Completed Tasks</h2>
              <ul className={styles.completedList}>
                {completedTasks.slice(0, 3).map((task) => (
                  <li key={task.id} className={styles.completedItem}>
                    <span style={{ fontWeight: 500 }}>{task.name}</span>
                    <span className={styles.completedDate}>
                      {task.completedAt && typeof task.completedAt._seconds === 'number'
                        ? `(${new Date(task.completedAt._seconds * 1000).toLocaleDateString()})`
                        : '(No date)'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'gamification' && (
        <div className={styles.gamificationCard}>
          <p>Gamification features coming soon!</p>
        </div>
      )}

      {/* Bulk state change dialog */}
      {showBulkDialog && (
        <div className={styles.bulkDialogOverlay}>
          <div className={styles.bulkDialog}>
            <h3 className={styles.bulkDialogTitle}>Change State for {selectedItems.length} items</h3>
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
              <button 
                onClick={() => setShowBulkDialog(false)} 
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkChange}
                className={styles.bulkButton}
                disabled={!bulkState || updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForYouPage; 