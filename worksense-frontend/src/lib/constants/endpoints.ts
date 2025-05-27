const SERVER = import.meta.env.VITE_API_URL || "http://localhost:5050";
export const API_URL = SERVER.endsWith("/api/v1") ? SERVER : SERVER + "/api/v2";

export const endpoints = {
    getProjectDetails:  (projectId:string) =>               `${API_URL}/projects/${projectId}`,
    getProjectMembers: (projectId:string) =>                `${API_URL}/projects/${projectId}/members`,
    getProjectMembersDetailed: (projectId:string) =>        `${API_URL}/projects/${projectId}/members/member-detail`,
    getUserProjects: () =>                                  `${API_URL}/projects`,
    updateMemberRole: (projectId:string, userId:string) =>  `${API_URL}/projects/${projectId}/members/${userId}`,
    addMemberToProject: (projectId:string) =>               `${API_URL}/projects/${projectId}/members`,
    removeMemberFromProject: (projectId:string, userId:string) =>  `${API_URL}/projects/${projectId}/${userId}`,
    //updateProject: (projectId:string) =>                    `${API_URL}/projects/${projectId}`,
    //deleteProject: (projectId:string) =>                       `${API_URL}/projects/${projectId}`,

    // AUTH
    login: () => `${API_URL}/login`,

    // BUGS
    getBugs: () => "",
    getBug: () => "",
    updateBug: () => "",
    createBug: () => "",
    deleteBug: () => "",

    // EPICS
    getEpics: (projectId:string) =>  `${API_URL}/project/${projectId}/epics`,
    getEpic: (projectId:string, epicId:string) => `${API_URL}/project/${projectId}/epic/${epicId}`,
    updateEpic: (projectId:string, epicId:string) => `${API_URL}/project/${projectId}/epic/${epicId}`,
    createEpic: (projectId:string) => `${API_URL}/project/${projectId}/epic`,
    deleteEpic: (projectId:string, epicId:string) => `${API_URL}/project/${projectId}/epic/${epicId}`, 

    // MEMBERS
    getMembers: (projectId:string) => `${API_URL}/project/${projectId}/members`,
    getMember: (projectId:string, memberId:string) => `${API_URL}/project/${projectId}/member/${memberId}`,
    updateMember: (projectId:string, memberId:string) => `${API_URL}/project/${projectId}/member/${memberId}`,
    createMember: (projectId:string) => `${API_URL}/project/${projectId}/member`,
    deleteMember: (projectId:string, memberId:string) => `${API_URL}/project/${projectId}/member/${memberId}`,

    // PROJECTS
    getProjects: () => `${API_URL}/projects`,
    getProject: (projectId:string) => `${API_URL}/project/${projectId}`,
    updateProject: (projectId:string) => `${API_URL}/project/${projectId}`,
    createProject: () => `${API_URL}/project/`,
    deleteProject: (projectId:string) => `${API_URL}/project/${projectId}`,

    // SPRINTS
    getSprints: (projectId:string) => `${API_URL}/project/${projectId}/sprints`,
    getSprint: (projectId:string, sprintId:string) => `${API_URL}/project/${projectId}/sprint/${sprintId}`,
    updateSprint: (projectId:string, sprintId:string) => `${API_URL}/project/${projectId}/sprint/${sprintId}`,
    createSprint: (projectId:string) => `${API_URL}/project/${projectId}/sprint`,
    deleteSprint: (projectId:string, sprintId:string) => `${API_URL}/project/${projectId}/sprint/${sprintId}`,

    // STORIES
    getStories: (projectId:string) =>  `${API_URL}/project/${projectId}/stories`,
    getStory: (projectId:string, storyId:string) => `${API_URL}/project/${projectId}/story/${storyId}`,
    updateStory: (projectId:string, storyId:string) => `${API_URL}/project/${projectId}/story/${storyId}`,
    createStory: (projectId:string) => `${API_URL}/project/${projectId}/story`,
    deleteStory: (projectId:string, storyId:string) => `${API_URL}/project/${projectId}/story/${storyId}`, 

    // TICKETS
    getTickets: () => "",
    getTicket: () => "",
    updateTicket: () => "",
    createTicket: () => "",
    deleteTicket: () => "",

    // USERS
    getUsers: () => `${API_URL}/users`,
    getUser: (userId:string) => `${API_URL}/user/${userId}`,
    updateUser: (userId:string) => `${API_URL}/user/${userId}`,
    createUser: () => `${API_URL}/user`,
    deleteUser: (userId:string) => `${API_URL}/user/${userId}`,

}