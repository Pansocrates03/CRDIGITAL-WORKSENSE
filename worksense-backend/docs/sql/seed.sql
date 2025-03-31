-- Insert to Roles
INSERT INTO Roles (RoleName) VALUES ('Admin');
INSERT INTO Roles (RoleName) VALUES ('Scrum Master');
INSERT INTO Roles (RoleName) VALUES ('Product Owner');
INSERT INTO Roles (RoleName) VALUES ('Developer');

-- Insert to Users
INSERT INTO Users (Username, PasswordHash, CreatedAt, RoleID) VALUES ('admin', 'admin', GETDATE(), 1);
INSERT INTO Users (Username, PasswordHash, CreatedAt, RoleID) VALUES ('user', 'user', GETDATE(), 2);
INSERT INTO Users (Username, PasswordHash, CreatedAt, RoleID) VALUES ('po', 'po',  GETDATE(), 3);
INSERT INTO Users (Username, PasswordHash, CreatedAt, RoleID) VALUES ('dev', 'dev', GETDATE(), 4);

-- Insert to RevokedTokens
-- INSERT INTO RevokedTokens (Token, UserID) VALUES ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGVJRCI6MSwiaWF0IjoxNjI5MzUwNzYyLCJleHAiOjE2MjkzNTA3NjJ9.1')