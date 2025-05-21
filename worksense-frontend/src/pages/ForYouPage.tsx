import React, { useState } from 'react';
import styles from './ForYouPage.module.css';

const assignedItems = [
  { id: '1', type: 'story', name: 'User Story 1', status: 'In Progress' },
  { id: '2', type: 'bug', name: 'Bug 1', status: 'To Do' },
  { id: '3', type: 'epic', name: 'Epic 1', status: 'New' },
  { id: '4', type: 'task', name: 'Task 1', status: 'In Review' },
  { id: '5', type: 'knowledge', name: 'Knowledge Base 1', status: 'Done' },
];

const completedTasks = [
  { id: '6', name: 'Completed Task 1', completedAt: '2024-06-01' },
  { id: '7', name: 'Completed Task 2', completedAt: '2024-05-28' },
  { id: '8', name: 'Completed Task 3', completedAt: '2024-05-20' },
];

const allStates = ['New', 'To Do', 'In Progress', 'In Review', 'Done'];
const bulkTypes = ['story', 'bug', 'task', 'knowledge'];

const ForYouPage = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkState, setBulkState] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'gamification'>('general');

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkChange = () => {
    setShowBulkDialog(true);
  };

  const confirmBulkChange = () => {
    setShowBulkDialog(false);
    setSelectedItems([]);
  };

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
                    <span className={styles.completedDate}>({task.completedAt})</span>
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
            <select value={bulkState} onChange={e => setBulkState(e.target.value)} style={{ width: '100%', marginBottom: 16 }}>
              <option value="">Select new state</option>
              {allStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <div className={styles.bulkDialogActions}>
              <button onClick={() => setShowBulkDialog(false)} className={styles.cancelButton}>Cancel</button>
              <button
                onClick={confirmBulkChange}
                className={styles.bulkButton}
                disabled={!bulkState}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForYouPage; 