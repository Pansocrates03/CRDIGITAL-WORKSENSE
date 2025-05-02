// src/pages/MembersPage.tsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import {  useQueryClient } from '@tanstack/react-query';

// Components
import { Button } from '@/components/ui/button';
import MembersList from '@/components/MembersList/MembersList';
import EditMemberModal from '../../components/EditMemberModal/EditMemberModal';
import MemberSelection from '@/components/NewProjectModal/MemberSelection';
import { DeleteMemberAlert } from './DeleteMemberAlert';

// Types
import MemberDetailed from '@/types/MemberDetailedType';
import Member from '@/types/MemberType';

// Services
import { projectService } from '@/services/projectService';
import { useMembers, useDeleteMember, useUpdateMemberRole } from '@/hooks/useMembers';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';

const MembersPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  const { data: members = [], isLoading } = useMembers(projectId!);
  const [selectedMember, setSelectedMember] = useState<MemberDetailed | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);

  // Alert states
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<MemberDetailed | null>(null);

  const availableRoles = ['product-owner', 'scrum-master', 'developer', 'viewer'];
  const isProductOwner = members.some(member => member.userId === user?.userId && member.projectRoleId === 'product-owner');

  const deleteMemberMutation = useDeleteMember(projectId!);
  const updateMemberRoleMutation = useUpdateMemberRole(projectId!);
  const { isLoading: isUsersLoading, data: users = [] } = useUsers();

  const handleEditClick = (member: MemberDetailed) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleRoleUpdate = async (userId: number, role: string) => {
    try {
      await updateMemberRoleMutation.mutateAsync({ userId, role });
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
      await deleteMemberMutation.mutateAsync(memberToDelete.userId);
      setShowDeleteAlert(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error('Failed to delete member:', error);
    }
  };

  const handleAddMember = (member: Member) => {
    setSelectedMembers((prevMembers) => [...prevMembers, member]);
  };

  const handleRemoveMember = (userId: number) => {
    setSelectedMembers(selectedMembers.filter((m) => m.userId !== userId));
  };

  const handleAddMembersSubmit = async () => {
    try {
      for (const member of selectedMembers) {
        await projectService.addMemberToProject(
          projectId!, 
          member.userId, 
          member.projectRoleId
        );
      }
      setSelectedMembers([]);
      setIsAddingMembers(false);
      // Invalidate the members query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    } catch (error) {
      console.error('Failed to add members:', error);
    }
  };

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
        {isProductOwner && (
          <Button
            variant="default"
            size="default"
            className="bg-[#ac1754] hover:bg-[#8e0e3d] flex-shrink-0"
            onClick={() => setIsAddingMembers(true)}
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      <div className="border-b border-border my-4"></div>

      {isAddingMembers && isProductOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Members</h3>
              <button
                onClick={() => {
                  setIsAddingMembers(false);
                  setSelectedMembers([]);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <MemberSelection
              users={users}
              selectedMembers={selectedMembers}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              isLoading={isUsersLoading}
              availableUsers={users.filter(
                (user) => 
                  !selectedMembers.some((member) => member.userId === user.userId) &&
                  !members.some((member) => member.userId === user.userId)
              )}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingMembers(false);
                  setSelectedMembers([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMembersSubmit}
                disabled={selectedMembers.length === 0}
              >
                Add Members
              </Button>
            </div>
          </div>
        </div>
      )}

      <MembersList 
        projectId={projectId!} 
        members={members} 
        onEdit={isProductOwner ? handleEditClick : undefined} 
        onDelete={isProductOwner ? handleDeleteMember : undefined}
      />

      {isProductOwner && (
        <>
          <EditMemberModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            member={selectedMember}
            availableRoles={availableRoles}
            onSubmit={handleRoleUpdate}
          />

          {showDeleteAlert && memberToDelete && (
            <DeleteMemberAlert
              memberName={memberToDelete.name}
              onClose={() => {
                setShowDeleteAlert(false);
                setMemberToDelete(null);
              }}
              onDelete={handleConfirmDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MembersPage;