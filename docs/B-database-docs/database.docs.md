# Documentación de la base de datos
> Este proyecto hizo uso de dos bases de datos. Una relacional, específicamente MS SQL Server. Y una no relacional: Firestore.

## Modelo lógico de datos
```
Firestore (Database)
├── availablePermissions (Collection)
│   ├── permissionID (Doc)
│      ├── category
│      ├── description
│      ├── key
|
├── projectRoles (Collection)
│   ├── roleId (Doc)
│      ├── name
│      ├── permissions
|
├── projects (Collection)
│   ├── projectId (Doc)
│      ├── conext
│      ├── createdAt
│      ├── description
│      ├── name
│      ├── ownerID
│      ├── status
|      │
│      ├── epics (Collection)
|      │    ├── epicId (Doc)
|      │        ├── createdAt
|      │        ├── description
|      │        ├── name
|      │        ├── priority
|      │        ├── startDate
|      │        ├── status
|      │        ├── updatedAt
|      │
│      ├── members (Collection)
|      │    ├── storyId (Doc)
|      │        ├── joinedAt
|      │        ├── projectRoleId
|      │        ├── updatedAt
|      │
│      ├── stories (Collection)
|      │    ├── storyId (Doc)
|      │        ├── description
|      │        ├── name
|      │        ├── parentId
|      │        ├── priority
|      │        ├── sprintId
|      │        ├── status
|      │        ├── storyPoints
|      │
│      ├── tickets (Collection)
|      │    ├── ticketId (Doc)
|      │        ├── assignetTo
|      │        ├── description
|      │        ├── id
|      │        ├── parentId
|      │        ├── priority
|      │        ├── status
|      │        ├── tasks
|      │        ├── updatedAt
|      │
│      ├── sprints (Collection)
|      │    ├── sprintId (Doc)
|      │        ├── columns
|      │        ├── createdAt
|      │        ├── endDate
|      │        ├── goal
|      │        ├── id
|      │        ├── items
|      │        ├── name
|      │        ├── status
|      │        ├── updatedAt


```
