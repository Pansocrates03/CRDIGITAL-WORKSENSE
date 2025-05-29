const SERVER = import.meta.env.VITE_API_URL || "http://localhost:5050";
export const API_URL = SERVER.endsWith("/api/v1") ? SERVER : SERVER + "/api/v2";

export const endpoints = {

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
    updateMemberRole: (projectId:string, memberId:string) => `${API_URL}/project/${projectId}/member/${memberId}`,

    // PROJECTS
    getProjects: () => `${API_URL}/projects`,
    getProject: (projectId:string) => `${API_URL}/project/${projectId}`,
    updateProject: (projectId:string) => `${API_URL}/project/${projectId}`,
    createProject: () => `${API_URL}/project/`,
    deleteProject: (projectId:string) => `${API_URL}/project/${projectId}`,

    // ROLES
    getRoles: (projectId:string) => `${API_URL}/project/${projectId}`,
    getRole: (projectId:string, roleId:string) => `${API_URL}/project/${projectId}/${roleId}`,
    updateRole: (projectId:string, roleId:string) => `${API_URL}/project/${projectId}/${roleId}`,
    createRole: (projectId:string) => `${API_URL}/project/${projectId}`,
    deleteRole: (projectId:string, roleId:string) => `${API_URL}/project/${projectId}/${roleId}`,

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
    getTickets: (projectId:string) => `${API_URL}/project/${projectId}/tickets`,
    getTicket: (projectId:string, ticketId:string) => `${API_URL}/project/${projectId}/ticket/${ticketId}`,
    updateTicket: (projectId:string, ticketId:string) => `${API_URL}/project/${projectId}/ticket/${ticketId}`,
    createTicket: (projectId:string) => `${API_URL}/project/${projectId}/ticket`,
    deleteTicket: (projectId:string, ticketId:string) => `${API_URL}/project/${projectId}/ticket/${ticketId}`,

    // USERS
    getUsers: () => `${API_URL}/users`,
    getUser: (userId:string) => `${API_URL}/user/${userId}`,
    updateUser: (userId:string) => `${API_URL}/user/${userId}`,
    createUser: () => `${API_URL}/user`,
    deleteUser: (userId:string) => `${API_URL}/user/${userId}`,

}