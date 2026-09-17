-- =============================================
-- SISTEMA DE REGISTRO DE PRODUCTOS (Urban's)
-- Script para SQL Server Management Studio 22
--
-- IMPORTANTE: el nombre de la base (Posse) debe
-- coincidir con DB_NAME del archivo Server/.env
-- =============================================

-- 1) Crear la base de datos si no existe
IF DB_ID('Posse') IS NULL
BEGIN
    CREATE DATABASE Posse;
END
GO

USE Posse;
GO

-- 2) Crear la tabla si no existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tarjetas')
BEGIN
    CREATE TABLE Tarjetas (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        codigo      VARCHAR(50)  NOT NULL,
        nombre      VARCHAR(150) NOT NULL,
        descripcion NVARCHAR(MAX) NULL,
        talle       VARCHAR(20)  NULL,
        precio      DECIMAL(10,2) NOT NULL DEFAULT 0,
        stock       INT NOT NULL DEFAULT 0,
        imagen      VARCHAR(255) NULL
    );
END
GO

-- 3) Datos de ejemplo (opcional, puede eliminarse)
IF NOT EXISTS (SELECT * FROM Tarjetas)
BEGIN
    INSERT INTO Tarjetas (codigo, nombre, descripcion, talle, precio, stock, imagen)
    VALUES
        ('URB-001', 'Remera Básica', 'Remera de algodón 100% peinado, corte regular.', 'M', 12999.00, 50, 'https://picsum.photos/seed/remera1/400/400'),
        ('URB-002', 'Jean Clásico', 'Jean de corte recto con lavado medio.', 'L', 34999.00, 30, 'https://picsum.photos/seed/jean1/400/400'),
        ('URB-003', 'Zapatilla Urbana', 'Zapatilla con suela de goma y capellada de cuero.', '41', 59999.00, 20, 'https://picsum.photos/seed/urban1/400/400');
END
GO

-- 4) Verificar el contenido
SELECT id, codigo, nombre, talle, precio, stock FROM Tarjetas;
GO

-- 5) Tabla de Usuarios (para autenticación con bcrypt)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuarios')
BEGIN
    CREATE TABLE Usuarios (
        id            INT IDENTITY(1,1) PRIMARY KEY,
        nombre        VARCHAR(150) NOT NULL,
        email         VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        creado_en     DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO