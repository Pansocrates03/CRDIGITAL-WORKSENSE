import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {projectService} from "@/services/projectService";
import MemberDetailed from "@/types/MemberDetailedType";
import { endpoints } from "@/lib/constants/endpoints";
import Member from "@/types/MemberType";

export const useMembers = (projectId: string) => {
    const queryClient = useQueryClient();

    const query = useQuery<MemberDetailed[], Error>({
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
    const addMember = async (projectId:string, memberData:Member) => {
        try {
            const response = await fetch(endpoints.addMemberToProject(projectId), {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(memberData)
            })

            if (!response.ok) throw new Error('Failed to update user');

            queryClient.invalidateQueries({ queryKey: ["members"] })
        } catch (error) {
            console.error('Error updating user:', error);
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

    return {
        ...query,
        addMember,
        updateMember,
        deleteMember
    }

};
