import apiClient from "../api/apiClient";
import Member from "@/types/MemberType";
import MemberDetailed from "@/types/MemberDetailedType";
import BacklogItemType from "@/types/BacklogItemType";

import {API_URL, endpoints} from "@/lib/constants/endpoints";
import ProjectDetails from "@/types/ProjectSummary.ts";

interface CreateProject {
    ownerId: string;
    name: string;
    description: string;
    context: object;
    members: Array<Member>;
}

export const projectService = {
    // Gets the project details

    async fetchUserById(userId: number): Promise<MemberDetailed> { // Assuming MemberDetailed covers user details
        try {
            const response = await apiClient.get(`${API_URL}/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user with ID ${userId}:`, error);
            throw error;
        }
    },

    // Gets the list of members in a project
    async fetchProjectMembers(id: string): Promise<Member[]> {
        try {
            const response = await apiClient.get(
                `${API_URL}/projects/${id}/members`
            );

            return response.data;
        } catch (error) {
            console.error("Error fetching project members:", error);
            throw error;
        }
    },

    // Gets the list of the projects a member has access to
    async fetchUserProjects(): Promise<ProjectDetails[]> {
        try {
            const response = await apiClient.get(`${API_URL}/projects/`);
            return response.data;
        } catch (error) {
            console.error("Error fetching user projects:", error);
            throw error;
        }
    },

    // Gets backlog Items
    async fetchProjectItems(projectId: string): Promise<BacklogItemType[]> {
        try {
            const response = await apiClient.get(`/projects/${projectId}/backlog/items`);
            console.log("returning", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching backlog items", error);
            throw error;
        }
    },

    async updateBacklogItem(projectId: string, item: BacklogItemType) {
        try {
            console.log("Item to be sent", item);
            await apiClient.put(`/projects/${projectId}/backlog/items/${item.id}/?type=${item.type}`, item)
        } catch (error) {
            console.error("Error bla");
            throw error;
        }
    },

    // Update a member's role inside a project
    async updateMemberRole(
        projectId: string,
        userId: number,
        roleId: string
    ): Promise<void> {
        try {
            await apiClient.put(
                `${API_URL}/projects/${projectId}/members/${userId}`,
                {
                    projectRoleId: roleId,
                }
            );
        } catch (error) {
            console.error("Error updating member role:", error);
            throw error;
        }
    },

    // Add a member to a project with a role
    async addMemberToProject(
        projectId: string,
        userId: number,
        roleId: string
    ): Promise<void> {
        try {
            await apiClient.post(`${API_URL}/projects/${projectId}/members`, {
                userId: userId,
                projectRoleId: roleId,
            });
        } catch (error) {
            console.error("Error adding member to project:", error);
            throw error;
        }
    },

    // Remove a member from a project
    async removeMemberFromProject(
        projectId: string,
        userId: number
    ): Promise<void> {
        try {
            await apiClient.delete(
                `${API_URL}/projects/${projectId}/members/${userId}`
            );
        } catch (error) {
            console.error("Error removing member from project:", error);
            throw error;
        }
    },

    async createProject(receivedData: CreateProject): Promise<ProjectDetails> { // Assuming ProjectDetails is the return type
        try {
            // 1. Create the project, sending ownerId
            const projectCreationPayload = {
                name: receivedData.name,
                description: receivedData.description,
                context: receivedData.context || null,
                ownerId: receivedData.ownerId
            };
            console.log("Sending to create project endpoint (/project/):", projectCreationPayload);

            const response = await apiClient.post<ProjectDetails>(`${API_URL}/project/`, projectCreationPayload);

            const newProjectId = response.data.id;
            if (!newProjectId) {
                console.error("Project creation response missing ID:", response.data);
                throw new Error("Project creation successful, but no ID returned from backend.");
            }
            console.log(`Project created with ID: ${newProjectId}`);

            // 2. Prepare the list of members to add, ensuring the owner is included
            let membersToAdd = [...receivedData.members];

            const ownerAlreadyInMembersList = membersToAdd.find(
                (member) => member.userId === receivedData.ownerId
            );

            if (!ownerAlreadyInMembersList) {
                console.log(`Owner (userId: ${receivedData.ownerId}) not in initial members list. Adding them.`);
                membersToAdd.push({
                    userId: receivedData.ownerId,
                    projectRoleId: "product-owner",
                } as Member);
            }
            console.log(`Total members to add to project ${newProjectId}: ${membersToAdd.length}`, membersToAdd);


            // 3. Add all members (including the owner now)
            for (const member of membersToAdd) {
                if (!member.userId || !member.projectRoleId) {
                    console.warn("Skipping member due to missing userId or projectRoleId:", member);
                    continue;
                }
                const memberPayload = {
                    projectRoleId: member.projectRoleId,
                    userId: member.userId,
                };
                console.log(`Adding member to project ${newProjectId}:`, memberPayload);

                // Ensure this endpoint for adding a member is correct.
                // Example: /project/:projectId/member or /projects/:projectId/members
                // Based on previous client code, it might be:
                await apiClient.post(
                    `${API_URL}/project/${newProjectId}/member`, // Or /projects/${newProjectId}/members
                    memberPayload
                );
            }

            console.log("Finished adding members. Returning project data:", response.data);
            return response.data; // Return the created project details
        } catch (error) {
            console.error("Error in projectService.createProject:", error);
            // For Axios errors, more details can be logged:
            // if (axios.isAxiosError(error)) {
            //   console.error("Axios error config:", error.config);
            //   console.error("Axios error request:", error.request);
            //   console.error("Axios error response data:", error.response?.data);
            //   console.error("Axios error response status:", error.response?.status);
            // }
            throw error;
        }
    },

    updateProject: async (projectId: string, updated: any) => {
        try {
            await apiClient.put(`${API_URL}/project/${projectId}`, updated);
        } catch (error) {
            console.error("Error updating project:", error);
            throw error;
        }
    },

    deleteProject: async (projectId: string) => {
        try {
            await apiClient.delete(`${API_URL}/projects/${projectId}`);
        } catch (error) {
            console.error("Error deleting project:", error);
            throw error;
        }
    },
};
