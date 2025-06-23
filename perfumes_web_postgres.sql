-- Script para crear la base de datos y tablas en PostgreSQL

-- Crear la base de datos (ejecutar esto como usuario postgres)
-- CREATE DATABASE perfumes_web;

-- Conectarse a la base de datos
-- \c perfumes_web

-- Crear las tablas
CREATE TABLE administradores (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL,
  nombre VARCHAR(100),
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE perfumes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  tipo VARCHAR(50),
  genero VARCHAR(20),
  tamano VARCHAR(20),
  stock INTEGER DEFAULT 0,
  imagen VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_perfumes_nombre ON perfumes(nombre);
CREATE INDEX idx_perfumes_marca ON perfumes(marca);
CREATE INDEX idx_perfumes_activo ON perfumes(activo);

-- Insertar un administrador por defecto
INSERT INTO administradores (usuario, nombre, email, password) 
VALUES ('admin', 'Administrador', 'admin@perfumesweb.com', 'x000138da4983');

-- Comentarios sobre la migración
/*
Notas importantes sobre la migración de MySQL a PostgreSQL:

1. Diferencias en sintaxis SQL:
   - PostgreSQL usa $1, $2, etc. para parámetros en lugar de ? en MySQL
   - PostgreSQL usa COALESCE en lugar de IFNULL de MySQL
   - PostgreSQL usa SERIAL para campos autoincremento en lugar de AUTO_INCREMENT

2. Diferencias en tipos de datos:
   - INT en MySQL es INTEGER en PostgreSQL
   - DATETIME en MySQL es TIMESTAMP en PostgreSQL
   - TINYINT(1) en MySQL es BOOLEAN en PostgreSQL

3. Diferencias en funciones:
   - NOW() en MySQL es CURRENT_TIMESTAMP en PostgreSQL
   - CONCAT() funciona diferente en PostgreSQL (usa ||)

4. Diferencias en resultados de consultas:
   - En MySQL: const [rows] = await pool.query(...)
   - En PostgreSQL: const result = await pool.query(...); const rows = result.rows;

5. Diferencias en verificación de resultados:
   - En MySQL: result.affectedRows
   - En PostgreSQL: result.rowCount
*/