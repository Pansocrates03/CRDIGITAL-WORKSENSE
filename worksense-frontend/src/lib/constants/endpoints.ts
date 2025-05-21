const SERVER = "http://localhost:5050";
export const API_URL = SERVER + "/api/v1";

export const endpoints = {
    getProjectDetails:  (projectId:string) =>               `${API_URL}/projects/${projectId}`,
    getProjectMembers: (projectId:string) =>                `${API_URL}/projects/${projectId}/members`,
    getProjectMembersDetailed: (projectId:string) =>        `${API_URL}/projects/${projectId}/members/member-detail`,
    getUserProjects: () =>                                  `${API_URL}/projects`,
    updateMemberRole: (projectId:string, userId:string) =>  `${API_URL}/projects/${projectId}/members/${userId}`,
    addMemberToProject: (projectId:string) =>               `${API_URL}/projects/${projectId}/members`,
    removeMemberFromProject: (projectId:string, userId:string) =>  `${API_URL}/projects/${projectId}/${userId}`,
    updateProject: (projectId:string) => `${API_URL}/projects/${projectId}`,
    deleteProject: (projectId:string) => `${API_URL}/projects/${projectId}`
}