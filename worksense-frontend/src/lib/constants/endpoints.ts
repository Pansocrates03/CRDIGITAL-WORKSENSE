const SERVER = "http://localhost:5050";
export const API_URL = SERVER + "/api/v1";

export const endpoints = {
    // GETTERS
    getUserProjects: () => {
        return `${API_URL}/projects`
    },
    getProjectDetails:  (projectId:string) => {
        return `${API_URL}/projects/${projectId}`
    },
    getProjectMembersDetailed: (projectId:string) => {
        return `${API_URL}/projects/${projectId}/members/members-detail`
    },
    getProjectItems: (projectId:string) => {
        return `${API_URL}/projects/${projectId}/backlog/items`
    },
    getStories: (projectId:string, sprintId:string) => {
        return `${API_URL}/projects/${projectId}/sprints/0/userStories`
    },
    getUsers: () => {
        return `${API_URL}/users`
    },


    updateMemberRole: (projectId:string, userId:string) => {
        return `${API_URL}/projects/${projectId}/members/${userId}`
    },
    addMemberToProject: (projectId:string) => {
        return `${API_URL}/projects/${projectId}/members`
    },
    createProject: () => {
        return `${API_URL}/projects`
    },
    removeMemberFromProject: (projectId:string, userId:string) => {
        return `${API_URL}/projects/${projectId}/${userId}`
    }
}