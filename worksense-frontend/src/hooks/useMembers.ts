import {useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import Member, { AddMemberInput } from "@/types/MemberType"; // Make sure MemberType.ts has these exports
import { endpoints } from "@/lib/constants/endpoints";
import apiClient from "@/api/apiClient";

// Define the return type for the hook
type UseMembersReturn = UseQueryResult<Member[], Error> & {
    addMember: (memberData: AddMemberInput) => Promise<Member | void>; // API might return the created member
    deleteMember: (memberId: string) => Promise<void>;
    updateMemberRole: (memberId: string, projectRoleId: string) => Promise<Member | void>; // API might return the updated member
};

export const useMembers = (projectId: string): UseMembersReturn => {
    const queryClient = useQueryClient();
    const membersQueryKey: ["members", string] = ["members", projectId];

    const query = useQuery<Member[], Error, Member[], ["members", string]>({
        queryKey: membersQueryKey,
        queryFn: async () => {
            if (!projectId) return [];
            // Your backend endpoint should fetch members for the project
            // and transform Firestore Timestamps to a serializable format (e.g., ISO string or number)
            // if they are not already handled by your apiClient/server.
            // Axios will expect plain JSON.
            const response = await apiClient.get<Member[]>(endpoints.getMembers(projectId));
            // If Timestamps come as objects, you might need to convert them back to Timestamp objects here
            // or ensure your Member type expects the serialized format.
            return response.data.map(member => ({
                ...member,
                // Example: Convert ISO strings back to Firebase Timestamps if needed on client,
                // though usually you'd work with Date objects or strings on the client
                // and let the server handle Timestamp types.
                // joinedAt: new firebase.firestore.Timestamp(member.joinedAt.seconds, member.joinedAt.nanoseconds),
                // updatedAt: new firebase.firestore.Timestamp(member.updatedAt.seconds, member.updatedAt.nanoseconds),
            }));
        },
        enabled: !!projectId,
    });

    const deleteMember = async (memberId: string): Promise<void> => {
        try {
            // Your backend endpoint handles deleting the Firestore document
            await apiClient.delete(endpoints.deleteMember(projectId, memberId));
            queryClient.invalidateQueries({ queryKey: membersQueryKey });
        } catch (error) {
            console.error('Error deleting member:', error);
            throw error;
        }
    };

    const addMember = async (memberData: AddMemberInput): Promise<Member | void> => {
        try {

            const response = await apiClient.post<Member>(endpoints.createMember(projectId), memberData);
            queryClient.invalidateQueries({ queryKey: membersQueryKey });
            // The response.data should be the newly created member document, including the server-set fields.
            return response.data;
        } catch (error) {
            console.error('Error adding member:', error);
            throw error;
        }
    };

    // The generic `updateMember` is removed because updating `userId` or `joinedAt` is unlikely.
    // Specific updates like `updateMemberRole` are preferred.
    // If you need a more general update, define what fields are updatable.
    /*
    const updateMember = async (memberId: string, dataToUpdate: Partial<Omit<Member, 'id' | 'userId' | 'joinedAt'>>): Promise<Member | void> => {
        try {
            // Your backend endpoint handles updating the Firestore document.
            // It should also update the 'updatedAt' field using serverTimestamp().
            const response = await apiClient.put<Member>(endpoints.updateMember(projectId, memberId), dataToUpdate);
            queryClient.invalidateQueries({ queryKey: membersQueryKey });
            return response.data;
        } catch (error) {
            console.error('Error updating member:', error);
            throw error;
        }
    };
    */

    const updateMemberRole = async (memberId: string, projectRoleId: string): Promise<Member | void> => {
        try {
            // Your backend endpoint handles updating the 'projectRoleId' and 'updatedAt' in Firestore.
            const response = await apiClient.patch<Member>( // PATCH is suitable here
                endpoints.updateMemberRole(projectId, memberId),
                { projectRoleId } // Send only the data that needs to change
            );
            queryClient.invalidateQueries({ queryKey: membersQueryKey });
            return response.data;
        } catch (error) {
            console.error('Error updating member role:', error);
            throw error;
        }
    };

    return {
        ...query,
        addMember,
        // updateMember, // Uncomment if you implement a general update function
        deleteMember,
        updateMemberRole,
    };
};