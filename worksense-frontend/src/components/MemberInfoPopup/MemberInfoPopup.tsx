import React from 'react';
import styles from './MemberInfoPopup.module.css';

interface MemberInfoPopupProps {
  member: {
    id: number;
    name: string;
    role: string;
    avatar: string;
    email?: string;
    userId: string | number;
    projectId: string;
    roleId: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  };
  onClose: () => void;
}

const MemberInfoPopup: React.FC<MemberInfoPopupProps> = ({ member, onClose }) => {
  // Extract first and last name for generating a consistent avatar
  const [firstName = '', lastName = ''] = member.name.split(' ');
  const avatarUrl = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=random&color=fff&size=128`;

  // Format date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Safely get role from roleId
  const getRoleDisplay = (roleId: string | undefined) => {
    if (!roleId) return 'Member';
    try {
      return roleId.split('/').pop() || 'Member';
    } catch (error) {
      console.error('Error processing roleId:', error);
      return 'Member';
    }
  };

  return (
    <div 
      className={styles.popupOverlay}
      onClick={onClose}
    >
      <div 
        className={styles.popup}
        style={{
          top: 0,
          left: 0
        }}
        onClick={e => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.memberHeader}>
          <img 
            src={avatarUrl}
            alt={member.name} 
            className={styles.memberAvatar}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
            }}
          />
          <div className={styles.memberInfo}>
            <h3>{member.name}</h3>
            <span className={styles.role}>{member.role || 'Team Member'}</span>
          </div>
        </div>

        <div className={styles.memberDetails}>
          <div className={styles.detailRow}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>{member.email || 'No email available'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>User ID</span>
            <span className={styles.value}>{member.userId || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Role</span>
            <span className={styles.value}>{getRoleDisplay(member.roleId)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Status</span>
            <span className={`${styles.value} ${styles.status} ${styles[String(member.status || 'active').toLowerCase()]}`}>
              {member.status || 'Active'}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Member Since</span>
            <span className={styles.value}>{formatDate(member.createdAt)}</span>
          </div>
          {member.updatedAt && (
            <div className={styles.detailRow}>
              <span className={styles.label}>Last Updated</span>
              <span className={styles.value}>{formatDate(member.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberInfoPopup; 