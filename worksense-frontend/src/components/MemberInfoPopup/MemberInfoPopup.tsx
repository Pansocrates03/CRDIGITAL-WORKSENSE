import React from 'react';
import styles from './MemberInfoPopup.module.css';
import MemberDetailed from '@/types/MemberDetailedType';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';

interface MemberInfoPopupProps {
  member: MemberDetailed
  onClose: () => void;
}

const MemberInfoPopup: React.FC<MemberInfoPopupProps> = ({ member, onClose }) => {
  // Extract first and last name for generating a consistent avatar
  const [firstName = '', lastName = ''] = member.name.split(' ');

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

  // Format role display
  const formatRoleDisplay = (roleId: string | undefined) => {
    if (!roleId) return 'Team Member';
    
    // Remove any path or prefix from roleId
    const role = roleId.split('/').pop() || 'Team Member';
    
    // Split by hyphen and capitalize each word
    return role
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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
          <AvatarDisplay
            user = {{
              firstName,
              lastName,
              name: member.name,
              profilePicture: member.profilePicture
            }}
            size="xl"
          />
          <div className={styles.memberInfo}>
            <h3>{member.name}</h3>
            <span className={styles.role}>{formatRoleDisplay(member.projectRoleId)}</span>
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
            <span className={styles.value}>{formatRoleDisplay(member.projectRoleId)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Status</span>
            <span className={`${styles.value} ${styles.status} ${styles[String('active').toLowerCase()]}`}>
              {'Active'}
            </span>
          </div>
          {/*
          <div className={styles.detailRow}>
            <span className={styles.label}>Member Since</span>
            <span className={styles.value}>{formatDate(member.createdAt)}</span>
          </div>
          */}
          {/*
          {member.updatedAt && (
            <div className={styles.detailRow}>
              <span className={styles.label}>Last Updated</span>
              <span className={styles.value}>{formatDate(member.updatedAt)}</span>
            </div>
          )}
            */}
        </div>
      </div>
    </div>
  );
};

export default MemberInfoPopup; 