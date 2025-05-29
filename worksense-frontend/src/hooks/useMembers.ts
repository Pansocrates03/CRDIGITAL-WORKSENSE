import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import Member from "@/types/MemberType";
import { endpoints } from "@/lib/constants/endpoints";

export const useMembers = (projectId: string) => {
    const queryClient = useQueryClient();

    const query = useQuery<Member[], Error>({
        queryKey: ["members", projectId],
        queryFn: async () => {
            const response = await fetch(endpoints.getMembers(projectId));
            return response.json();
        },
    });

    const deleteMember = async (projectId:string, memberId:string) => {
        try {
            const response = await fetch(endpoints.deleteMember(projectId,memberId), {
                method: "DELETE"
            })
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
            queryClient.invalidateQueries({ queryKey: ["members"] })
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    };
    const addMember = async (projectId:string, memberData: { userId: string, projectRoleId: string }) => {
        try {
            const response = await fetch(endpoints.createMember(projectId), {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(memberData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to add member: ${response.status} ${response.statusText}`);
            }

            queryClient.invalidateQueries({ queryKey: ["members"] });
        } catch (error) {
            console.error('Error adding member:', error);
            throw error;
        }
    };
    const updateMember = async(projectId:string, memberId:string, memberData:Member) => {
        const response = await fetch(endpoints.updateMember(projectId, memberId), {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(memberData)
        })

        if (!response.ok) throw new Error('Failed to update user');

        queryClient.invalidateQueries({ queryKey: ["members"] })
    }

    const updateMemberRole = async (projectId: string, memberId: string, projectRoleId: string) => {
    const response = await fetch(endpoints.updateMemberRole(projectId, memberId), {
        method: "PATCH",
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectRoleId })
    });

    if (!response.ok) throw new Error('Failed to update member role');

    queryClient.invalidateQueries({ queryKey: ["members"] });
    };

    return {
        ...query,
        addMember,
        updateMember,
        deleteMember,
        updateMemberRole
    }

};
