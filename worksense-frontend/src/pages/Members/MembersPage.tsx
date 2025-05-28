// src/pages/MembersPage.tsx

import React, {useState} from 'react';
import {data, useParams} from 'react-router-dom';
import {PlusIcon} from 'lucide-react';

// Components
import {Button} from '@/components/ui/button';
import MembersList from '@/components/MembersList/MembersList';
import EditMemberModal from '../../components/EditMemberModal/EditMemberModal';
import MemberSelection from '@/components/NewProjectModal/MemberSelection';
import {DeleteMemberAlert} from './DeleteMemberAlert';
import { handleSuccess } from "@/utils/handleSuccessToast.ts";

// Types
import { ProjectMember } from '@/types/ProjectMemberType';

// HOOKS
import { useMembers } from '@/hooks/useMembers';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';

interface Role {
    id: string;
    name: string;
}

interface MembersListProps {
  projectMembers: ProjectMember[];
}

const MembersPage: React.FC = () => {
    const {id: projectId} = useParams<{ id: string }>();
    
    // HOOKS
    const {data: user} = useAuth();
    const {data: users, isLoading: isUsersLoading} = useUsers();
    const {data: members = [], isLoading: isMembersLoading } = useMembers(projectId!);
    

    const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingMembers, setIsAddingMembers] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<ProjectMember[]>([]);

    // Alert states
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<ProjectMember | null>(null);    

    const availableRoles: Role[] = [
        { id: 'product-owner', name: 'Product Owner' },
        { id: 'scrum-master', name: 'Scrum Master' },
        { id: 'developer', name: 'Developer' },
        { id: 'viewer', name: 'Viewer' }
    ];


    // Checamos si el usuario es el producto owner para mostrarle el boton de añadir usuario
    const isProductOwner = members.some(
    (member) => member.userId === user?.id && member.projectRoleId === 'product-owner'
    );


    
    const handleEditClick = (member: Member) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const handleDeleteMember = async (member: Member) => {
        setMemberToDelete(member);
        setShowDeleteAlert(true);
    };

    const handleAddMember = (member: Member) => {
        setSelectedMembers((prevMembers) => [...prevMembers, member]);
    };

    const handleRemoveMember = (userId: string) => {
        setSelectedMembers(selectedMembers.filter((m) => m.userId !== userId));
    };

    if (isMembersLoading) return <div>Loading members...</div>;

    return (
        <div className={"p-4 pt-3"}>
            <div className="flex items-baseline justify-between w-full">
                <div>
                    <h2 className="text-3xl mb-4 tracking-tight text-foreground ">Members</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage project members: add, update roles, or remove members from the project.
                    </p>
                </div>
                {isProductOwner && (
                    <Button
                        variant="default"
                        size="default"
                        onClick={() => setIsAddingMembers(true)}
                    >
                        <PlusIcon className="mr-1 h-4 w-4"/>
                        Add User
                    </Button>
                )}
            </div>

            <div className="border-b-2 border-b-gray-200 my-4"></div>

            {isAddingMembers && isProductOwner && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[var(--background-primary)] rounded-lg p-6 w-full max-w-2xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Add New Members</h2>
                            <Button
                                variant={"outline"}
                                onClick={() => {
                                    setIsAddingMembers(false);
                                    setSelectedMembers([]);
                                }}

                            >
                                X
                            </Button>
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
                                    !members.some((member) => member.userId === user.id)
                            )}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsAddingMembers(false);
                                    setSelectedMembers([]);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={"default"}
                                onClick={() => console.log("TO-DO")}
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
                        onSubmit={() => console.log("TODO")}
                    />

                    {memberToDelete && projectId && (
                        <DeleteMemberAlert
                            showDeleteAlert={showDeleteAlert}
                            memberName={memberToDelete.user.firstName || "unknown"}
                            onClose={() => {
                                setShowDeleteAlert(false);
                                setMemberToDelete(null);
                            }}
                            onDelete={() => deleteMember(projectId, memberToDelete.userId)}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default MembersPage;