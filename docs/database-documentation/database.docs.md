# Documentación de la base de datos

## Modelo lógico de datos
```
Firestore (Database)
├── availablePermissions (Collection)
│   ├── permissionID (Doc)
│      ├── category
│      ├── description
│      ├── key
├── projectRoles (Collection)
│   ├── roleId (Doc)
│      ├── name
│      ├── permissions
├── projects (Collection)
│   ├── projectId (Doc)
│      ├── conext
│      ├── createdAt
│      ├── description
│      ├── name
│      ├── ownerID
│      ├── status
│      ├── members (Collection)
|      │    ├── memberId (Doc)
|      │        ├── joinedAt
|      │        ├── projectRoleID
|      │        ├── userId
│      ├── backlog (Collection)
|      │    ├── Acceptance Criteria
|      │    ├── assignee Id
|      │    ├── authorId
|      │    ├── coverImage
|      │    ├── createdAt
|      │    ├── description


```

## Diagrama ER de la BD Relacional

## Script SQL de la BD Relacional