CREATE TABLE Genders (
    id INT IDENTITY(1,1) PRIMARY KEY, -- Identificador único del género
    name NVARCHAR(50) NOT NULL UNIQUE -- Nombre único del género
)

INSERT INTO Genders (id,name) VALUES (1, 'Masculino'), (2, 'Femenino'), (3, 'Otro');