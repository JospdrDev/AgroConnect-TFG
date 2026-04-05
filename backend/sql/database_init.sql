-- ==========================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS: AGROCONNECT
-- Especializado para integración con Symfony (make:entity)
-- ==========================================================

-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS agroconnect_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE agroconnect_db;

-- 2. LIMPIEZA DE TABLAS (Orden crítico por Llaves Foráneas)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS alertas;
DROP TABLE IF EXISTS fincas;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. CREACIÓN DE TABLAS

-- A. Entidad User (Usuario)
-- Importante: El campo 'roles' es JSON para compatibilidad con UserInterface de Symfony.
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(180) UNIQUE NOT NULL,
    roles JSON NOT NULL, -- Ej: ["ROLE_USER", "ROLE_ADMIN"]
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- B. Entidad Finca (Parcela)
-- El campo 'hectareas' usa DOUBLE PRECISION para representar el 'float' solicitado.
CREATE TABLE fincas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    hectareas DOUBLE PRECISION NOT NULL,
    cultivo VARCHAR(100) NOT NULL,
    geo_json JSON NOT NULL, -- Guarda el polígono o coordenadas
    CONSTRAINT FK_FINCA_USUARIO FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- C. Entidad Alerta (Avisos del sistema)
CREATE TABLE alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    finca_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- Ej: "RIESGO_HELADA"
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha DATETIME NOT NULL,
    CONSTRAINT FK_ALERTA_FINCA FOREIGN KEY (finca_id) REFERENCES fincas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. INSERCIÓN DE DATOS DE PRUEBA

-- Usuarios
INSERT INTO usuarios (email, roles, password, nombre) VALUES 
('admin@agroconnect.com', '["ROLE_ADMIN"]', '$2y$10$xyz...', 'Admin A.'),
('mario@agroconnect.com', '["ROLE_USER", "ROLE_AGRICULTOR"]', '$2y$10$xyz...', 'Mario B.'),
('jose@agroconnect.com', '["ROLE_USER"]', '$2y$10$xyz...', 'Jose P.'),
('ana@agroconnect.com', '["ROLE_USER"]', '$2y$10$xyz...', 'Ana M.');

-- 10 Fincas (Distribuidas)
INSERT INTO fincas (usuario_id, nombre, hectareas, cultivo, geo_json) VALUES 
(1, 'Finca El Limonar', 12.5, 'Limonero Verna', '{"type": "Polygon", "coordinates": [[[-1.04, 38.06], [-1.05, 38.07], [-1.04, 38.06]]]}'),
(1, 'Huerta del Segura', 5.2, 'Naranjo Navel', '{"type": "Polygon", "coordinates": [[[-1.24, 38.05], [-1.25, 38.06], [-1.24, 38.05]]]}'),
(2, 'Viñedos Altura', 45.0, 'Uva Monastrell', '{"type": "Polygon", "coordinates": [[[-1.32, 38.47], [-1.33, 38.48], [-1.32, 38.47]]]}'),
(1, 'Campo Cartagena Sur', 28.3, 'Brócoli', '{"type": "Polygon", "coordinates": [[[-0.95, 37.74], [-0.96, 37.75], [-0.95, 37.74]]]}'),
(3, 'Finca La Aljorra', 18.1, 'Alcachofa', '{"type": "Polygon", "coordinates": [[[-1.05, 37.67], [-1.06, 37.68], [-1.05, 37.67]]]}'),
(1, 'Olivares del Noroeste', 60.4, 'Olivo Picual', '{"type": "Polygon", "coordinates": [[[-1.89, 38.18], [-1.90, 38.19], [-1.89, 38.18]]]}'),
(2, 'Invernaderos Águilas', 8.7, 'Tomate Cherry', '{"type": "Polygon", "coordinates": [[[-1.58, 37.40], [-1.59, 37.41], [-1.58, 37.40]]]}'),
(1, 'Almendros Mula', 32.0, 'Almendro Marcona', '{"type": "Polygon", "coordinates": [[[-1.49, 38.04], [-1.50, 38.05], [-1.49, 38.04]]]}'),
(3, 'Frutales de Cieza', 15.6, 'Melocotonero', '{"type": "Polygon", "coordinates": [[[-1.41, 38.23], [-1.42, 38.24], [-1.41, 38.23]]]}'),
(4, 'La Vega Alta', 10.2, 'Albaricoquero', '{"type": "Polygon", "coordinates": [[[-1.29, 38.11], [-1.30, 38.12], [-1.29, 38.11]]]}');

-- Alertas Variadas
INSERT INTO alertas (finca_id, tipo, mensaje, leida, fecha) VALUES 
(1, 'RIESGO_HELADA', 'Probabilidad de helada del 80% en las próximas 6 horas.', false, NOW()),
(1, 'ALERTA_RIEGO', 'Nivel de humedad crítico detectado en sector A1.', true, '2026-03-30 10:15:00'),
(3, 'MANTENIMIENTO', 'Revisión programada de válvulas de presión.', false, NOW()),
(5, 'CRITICO', 'Fallo en la conexión del sensor de suelo principal.', false, NOW()),
(7, 'RIESGO_PLAGA', 'Condiciones climáticas favorables para la mosca blanca.', false, NOW()),
(2, 'ALERTA_RIEGO', 'Exceso de humedad detectado por lluvias recientes.', true, '2026-04-01 08:30:00'),
(9, 'MANTENIMIENTO', 'Finalización de periodo de abonado recomendada.', false, NOW()),
(10, 'RIESGO_HELADA', 'Alerta naranja: Descenso brusco de temperaturas.', false, NOW()),
(1, 'INFO', 'Sistema de fertirrigación actualizado correctamente.', true, NOW()),
(3, 'CRITICO', 'Detección de fuga de agua en tubería secundaria.', false, NOW());