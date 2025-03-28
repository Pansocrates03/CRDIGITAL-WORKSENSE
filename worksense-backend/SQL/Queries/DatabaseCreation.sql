-- Date: 2025-03-28

CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY, -- Identificador único del rol
    RoleName NVARCHAR(50) NOT NULL UNIQUE -- Nombre único del rol
);

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY, -- Identificador único del usuario
    Username NVARCHAR(50) NOT NULL UNIQUE, -- Nombre de usuario único
    PasswordHash NVARCHAR(256) NOT NULL, -- Hash de contraseña
    CreatedAt DATETIME DEFAULT GETDATE(), -- Fecha de creación
    RoleID INT NOT NULL, -- ID del rol del usuario
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) -- Relación con la tabla Roles
);

CREATE TABLE RevokedTokens (
    RevokedID INT IDENTITY(1,1) PRIMARY KEY, -- Identificador único del token revocado
    Token NVARCHAR(MAX) NOT NULL, -- Token JWT revocado
    UserID INT NOT NULL, -- ID del usuario al que pertenece el token
    RevocationDate DATETIME DEFAULT GETDATE(), -- Fecha de revocación
    FOREIGN KEY (UserID) REFERENCES Users(UserID) -- Relación con la tabla Users
);