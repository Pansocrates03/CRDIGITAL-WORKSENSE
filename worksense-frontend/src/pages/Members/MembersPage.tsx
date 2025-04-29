// src/pages/MembersPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import MembersList from '@/components/MembersList/MembersList';
import EditMemberModal from '../../components/EditMemberModal/EditMemberModal';
import { projectService } from '@/services/projectService';
import MemberDetailed from '@/types/MemberDetailedType';

const MembersPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [members, setMembers] = useState<MemberDetailed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberDetailed | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      <MembersList projectId={projectId!} members={members} onEdit={handleEditClick} />

      <EditMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        availableRoles={availableRoles}
        onSubmit={handleRoleUpdate}
      />
    </div>
  );
};

export default MembersPage;
