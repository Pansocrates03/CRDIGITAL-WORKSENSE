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
    @password NVARCHAR(256) -- Contraseña proporcionada por el usuario
AS
BEGIN
    -- Busca al usuario y valida la contraseña
    DECLARE @storedHash NVARCHAR(256);

    SELECT @storedHash = passwordHash
    FROM Users
    WHERE Username = @username;

    IF @storedHash IS NULL
    BEGIN
        -- Usuario no encontrado
        SELECT 0 AS IsValid;
        RETURN;
    END

    -- Comparar hash de la contraseña
    IF (PWDCOMPARE(@password, @storedHash) = 1)
    BEGIN
        -- Credenciales válidas
        SELECT 1 AS IsValid;
    END
    ELSE
    BEGIN
        -- Contraseña incorrecta
        SELECT 0 AS IsValid;
    END
END;
