// src/pages/MembersPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import MembersList from '@/components/MembersList/MembersList';
import EditMemberModal from '../../components/EditMemberModal/EditMemberModal';
import { Alert } from '@/components/Alert/Alert';

// Types
import MemberDetailed from '@/types/MemberDetailedType';

// Services
import { projectService } from '@/services/projectService';


const MembersPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [members, setMembers] = useState<MemberDetailed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberDetailed | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Alert states
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<MemberDetailed | null>(null);

  const availableRoles = ['product-owner', 'scrum-master', 'developer', 'viewer'];

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.fetchProjectMembersDetailed(projectId!);
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (member: MemberDetailed) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleRoleUpdate = async (userId: number, role: string) => {
    try {
      await projectService.updateMemberRole(projectId!, userId, role);
      await fetchMembers(); // Refresh list
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleDeleteMember = async (member: MemberDetailed) => {
    setMemberToDelete(member);
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete || !projectId) return;
    try {
      await projectService.removeMemberFromProject(projectId, memberToDelete.userId);
      await fetchMembers();
      setShowDeleteAlert(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error('Failed to delete member:', error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchMembers();
    }
  }, [projectId]);

  if (isLoading) return <div>Loading members...</div>;

  return (
    <div>
      <div className="flex items-baseline justify-between w-full">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Members</h2>
          <p className="text-muted-foreground mt-1">
            Manage project members: add, update roles, or remove members from the project.
          </p>
        </div>
        <Button
          variant="default"
          size="default"
          className="bg-[#ac1754] hover:bg-[#8e0e3d] flex-shrink-0"
        >
          <PlusIcon className="mr-1 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="border-b border-border my-4"></div>

      <MembersList 
        projectId={projectId!} 
        members={members} 
        onEdit={handleEditClick} 
        onDelete={handleDeleteMember}
      />

      <EditMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        availableRoles={availableRoles}
        onSubmit={handleRoleUpdate}
      />

      {showDeleteAlert && memberToDelete && (
        <Alert
          type="error"
          title="Delete Member"
          message={`Are you sure you want to remove ${memberToDelete.name} from this project?`}
          onClose={() => {
            setShowDeleteAlert(false);
            setMemberToDelete(null);
          }}
          onAction={handleConfirmDelete}
          actionLabel="Delete"
        />
      )}

    </div>
  );
};

export default MembersPage;
