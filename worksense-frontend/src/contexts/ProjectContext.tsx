import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

import type { Project } from "@/types/ProjectType";
import { describe } from "node:test";

const ProjectContext = createContext<Project | undefined>(undefined)

export function fetchProject() {

    const [getProjectContext, setProjectContext] = useContext(ProjectContext)

    setProjectContext({
        id: "12345",
        name: "projectName",
        description: "pdesnjiksdnfjkdsnfjkds",
        status: "active",
        lastChange: "fnjdksfds",
        members: [],
        items: [],
        roles: []
    })

}

export function getProjectInfo() {
    const project = useContext(ProjectContext);
    if(!project) throw Error("There is no project in the context, you must fetch it first")

    return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        lastChange: project.lastChange
    }

}

export function getProjectRoles() {
    const project = useContext(ProjectContext);
    if(!project) throw Error("There is no project in the context, you must fetch it first")

    return project.roles
}