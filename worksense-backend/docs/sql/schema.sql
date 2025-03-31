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


-- Stored procedures

GO

-- Un procedimiento para registrar nuevos usuarios en la base de datos.
CREATE PROCEDURE spUserRegistration 
    @username NVARCHAR(50),
    @passwordHash NVARCHAR(256), -- Usa hashes seguros, nunca almacenes contraseñas en texto plano
    @role INT
AS
BEGIN
    INSERT INTO Users (Username, PasswordHash, RoleID) 
    VALUES (@username, @passwordHash, @role);
END;

GO

-- Un procedimiento para validar credenciales al iniciar sesión.
CREATE PROCEDURE spValidateUser
    @username NVARCHAR(50),
    @passwordHash NVARCHAR(256)
AS
BEGIN
    SELECT UserID FROM Users 
    WHERE Username = @username AND PasswordHash = @passwordHash;
END;

GO

-- Un procedimiento para registrar o revocar tokens en caso de logout o expiración.
CREATE PROCEDURE spTokenRevocation
    @token NVARCHAR(MAX),
    @userID INT
AS
BEGIN
    INSERT INTO RevokedTokens (Token, UserID, RevocationDate) 
    VALUES (@token, @userID, GETDATE());
END;

GO

-- Si tu sistema requiere roles de usuario, implementa un procedimiento para asignar roles.
CREATE PROCEDURE spUserRolesManagement
    @userID INT,
    @roleID INT
AS
BEGIN
    INSERT INTO UserRoles (UserID, RoleID) 
    VALUES (@userID, @roleID);
END;

GO

-- Checar si un usuario ya existe en la base de datos.
CREATE PROCEDURE spCheckUserExists
    @username NVARCHAR(50)
AS
BEGIN
    -- Verifica si el usuario ya existe
    IF EXISTS (
        SELECT 1 FROM Users WHERE Username = @username
    )
    BEGIN
        -- Devuelve 1 si el usuario existe
        SELECT 1 AS UserExists;
    END
    ELSE
    BEGIN
        -- Devuelve 0 si el usuario no existe
        SELECT 0 AS UserExists;
    END
END;

GO

CREATE PROCEDURE spValidateCredentials
    @username NVARCHAR(50),
    @password NVARCHAR(256)
AS
BEGIN
    -- Busca al usuario con su información de rol
    DECLARE @storedHash NVARCHAR(256);
    DECLARE @userID INT;
    DECLARE @roleID INT;
    DECLARE @roleName NVARCHAR(50);

    SELECT 
        @storedHash = PasswordHash,
        @userID = UserID,
        @roleID = RoleID
    FROM Users u
    WHERE Username = @username;

    IF @storedHash IS NULL
    BEGIN
        -- Usuario no encontrado
        SELECT 
            0 AS IsValid, 
            NULL AS UserID, 
            NULL AS RoleID, 
            NULL AS RoleName;
        RETURN;
    END

    -- Devolver la información para validación en la aplicación
    SELECT 
        1 AS IsValid, 
        @userID AS UserID, 
        @roleID AS RoleID,
        (SELECT RoleName FROM Roles WHERE RoleID = @roleID) AS RoleName,
        @storedHash AS PasswordHash;
END;
GO