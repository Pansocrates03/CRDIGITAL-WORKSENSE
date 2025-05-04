-- Date: 2025-03-28

-- Run ./schema/countries.sql
-- Run ./schema/languages.sql
-- Run ./schema/genders.sql

CREATE TABLE Users (
    id INT NOT NULL PRIMARY KEY IDENTITY,            -- Identificador único del usuario
    email VARCHAR(100) NOT NULL UNIQUE,      -- Correo electrónico único
    passwordHash VARCHAR(100) NOT NULL,      -- Contraseña del usuario
    firstName VARCHAR(100) NOT NULL,         -- Nombre del usuario
    lastName VARCHAR(100) NOT NULL,          -- Apellido del usuario
    nickName VARCHAR(100),                   -- Apodo del usuario
    gender INT NOT NULL DEFAULT 3,          -- Género del usuario
    country VARCHAR(2) NOT NULL DEFAULT 'MX',       -- País del usuario
    lang INT NOT NULL DEFAULT 1,            -- Idioma del usuario
    timezone INT NOT NULL DEFAULT -6,       -- Zona horaria del usuario en base a UTC
    pfp VARCHAR(50),                        -- URL de la foto de perfil
    isadmin BIT NOT NULL DEFAULT 0,         -- Indica si el usuario es administrador
    createdAt DATETIME DEFAULT GETDATE(),   -- Fecha de creación
    lastSignIn DATETIME DEFAULT GETDATE(),  -- Fecha del último inicio de sesión
    -- Foreign Keys
    FOREIGN KEY (country) REFERENCES Countries(alpha2),
    FOREIGN KEY (lang) REFERENCES Languages(id),
);

-- Todo:
-- CREATE TABLE UserTokens (
--     id INT NOT NULL PRIMARY KEY, -- Identificador único del token
--     userId INT NOT NULL, -- ID del usuario al que pertenece el token
--     token VARCHAR(50) NOT NULL, -- Token de acceso
--     createdAt DATETIME DEFAULT GETDATE(), -- Fecha de creación del token
--     expiresAt DATETIME DEFAULT GETDATE(), -- Fecha de expiración del token
--     FOREIGN KEY (userId) REFERENCES Users(id) -- Relación con la tabla de usuarios
-- );





-----------------------
-- STORED PROCEDURES --
-----------------------





GO

-- Un procedimiento para obtener la información del usuario por ID.
CREATE PROCEDURE spGetUserById
    @userId INT
AS
BEGIN
    SELECT id, email, firstName, lastName, nickName, gender, country, lang, timezone, pfp, isadmin, createdAt,lastSignIn
    FROM Users 
    WHERE ID = @userId;
END;
GO

-- Un procedimiento para registrar nuevos usuarios en la base de datos.
CREATE PROCEDURE spUserRegistration 
    @email NVARCHAR(50),
    @firstName NVARCHAR(50),
    @lastName NVARCHAR(50),
    @gender INT,
    @passwordHash NVARCHAR(256)
AS
BEGIN
    -- Validación de parámetros
    IF EXISTS (SELECT 1 FROM Users WHERE Email = @email)
    BEGIN
        RAISERROR('El correo electrónico ya está registrado.', 16, 1);
        RETURN;
    END

    -- Inserción de nuevo usuario
    INSERT INTO Users (email, firstName, lastName, gender, passwordHash) 
    VALUES (@email, @firstName, @lastName, @gender, @passwordHash);
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

-- Checar si un usuario ya existe en la base de datos por ID o username
ALTER PROCEDURE spCheckUserExists
    @userId INT = NULL,
    @username NVARCHAR(50) = NULL
AS
BEGIN
    -- Validación de parámetros
    IF @userId IS NULL AND @username IS NULL
    BEGIN
        RAISERROR('Debe proporcionar un ID de usuario o un nombre de usuario', 16, 1);
        RETURN;
    END
    
    -- Verifica si el usuario ya existe basado en ID o username
    IF @userId IS NOT NULL
    BEGIN
        -- Búsqueda por ID
        IF EXISTS (SELECT 1 FROM Users WHERE UserId = @userId)
        BEGIN
            SELECT 1 AS UserExists;
            RETURN;
        END
    END
    ELSE IF @username IS NOT NULL
    BEGIN
        -- Búsqueda por username
        IF EXISTS (SELECT 1 FROM Users WHERE Username = @username)
        BEGIN
            SELECT 1 AS UserExists;
            RETURN;
        END
    END
    
    -- Si no se encontró el usuario con ningún parámetro
    SELECT 0 AS UserExists;
END;

GO

CREATE PROCEDURE spValidateCredentials
    @Email NVARCHAR(50),
    @Password NVARCHAR(256)
AS
BEGIN
    DECLARE @StoredHash NVARCHAR(256);
    DECLARE @UserID INT;

    -- Obtener el hash de la contraseña y el ID del usuario
    SELECT 
        @StoredHash = PasswordHash,
        @UserID = ID
    FROM Users
    WHERE Email = @Email;

    -- Si no existe el usuario
    IF @StoredHash IS NULL
    BEGIN
        SELECT 
            0 AS IsValid, 
            NULL AS UserID,
            NULL AS Email,
            NULL AS FirstName,
            NULL AS LastName,
            NULL AS Gender;
        RETURN;
    END;

    -- Devolver la información completa del usuario
    SELECT 
        1 AS IsValid, 
        ID AS UserID,
        Email,
        FirstName,
        LastName,
        Gender
    FROM Users
    WHERE ID = @UserID;
END;
GO


--CREATE PROCEDURE spGetAllUsers
--    @PageNumber INT,
--   @PageSize INT
--AS
--BEGIN
--    SELECT * FROM Users
--    ORDER BY name
--    OFFSET (@PageNumber - 1) * @PageSize ROWS
--    FETCH NEXT @PageSize ROWS ONLY;
--END;
--GO

CREATE PROCEDURE spGetUsers
AS
BEGIN
    SELECT * FROM Users;
END;
GO