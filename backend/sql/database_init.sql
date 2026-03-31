DROP TABLE IF EXISTS lecturas;
DROP TABLE IF EXISTS sensores;
DROP TABLE IF EXISTS fincas;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'agricultor') DEFAULT 'agricultor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fincas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    nombre VARCHAR(100) NOT NULL,
    propietario VARCHAR(100),
    municipio VARCHAR(100),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    superficie DECIMAL(10, 2), -- Hectáreas
    cultivo VARCHAR(100),
    estado VARCHAR(50), -- 'Óptimo', 'Alerta Riego', 'Mantenimiento', 'Crítico'
    num_sensores INT DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE sensores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    finca_id INT,
    nombre VARCHAR(50),
    tipo ENUM('temperatura', 'humedad', 'presion', 'caudal'),
    modelo VARCHAR(100),
    ultima_lectura DECIMAL(10, 2),
    unidad_medida VARCHAR(10),
    FOREIGN KEY (finca_id) REFERENCES fincas(id) ON DELETE CASCADE
);

-- INSERTAR USUARIOS DE PRUEBA
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Héctor G.', 'hector@agroconnect.com', '$2y$10$xyz...', 'admin'),
('Mario B.', 'mario@agroconnect.com', '$2y$10$xyz...', 'agricultor'),
('Juan P.', 'jp@agroconnect.com', '$2y$10$xyz...', 'agricultor');

-- INSERTAR 10 FINCAS DE PRUEBA (Región de Murcia)
INSERT INTO fincas (usuario_id, nombre, propietario, municipio, latitud, longitud, superficie, cultivo, estado, num_sensores) VALUES 
(1, 'Finca El Limonar', 'Héctor G.', 'Santomera', 38.0614, -1.0489, 12.5, 'Limonero Verna', 'Óptimo', 4),
(1, 'Huerta del Segura', 'Mario B.', 'Alguazas', 38.0512, -1.2458, 5.2, 'Naranjo Navel', 'Alerta Riego', 2),
(2, 'Viñedos Altura', 'Juan P.', 'Jumilla', 38.4744, -1.3241, 45.0, 'Uva Monastrell', 'Óptimo', 8),
(1, 'Campo Cartagena Sur', 'Héctor G.', 'Torre Pacheco', 37.7439, -0.9525, 28.3, 'Brócoli', 'Mantenimiento', 6),
(3, 'Finca La Aljorra', 'Agro SL', 'Cartagena', 37.6781, -1.0521, 18.1, 'Alcachofa', 'Crítico', 3),
(1, 'Olivares del Noroeste', 'Héctor G.', 'Moratalla', 38.1883, -1.8912, 60.4, 'Olivo Picual', 'Óptimo', 5),
(2, 'Invernaderos Águilas', 'Pedro S.', 'Águilas', 37.4022, -1.5828, 8.7, 'Tomate Cherry', 'Óptimo', 10),
(1, 'Almendros Mula', 'Héctor G.', 'Mula', 38.0411, -1.4902, 32.0, 'Almendro Marcona', 'Alerta Riego', 2),
(3, 'Frutales de Cieza', 'Ana M.', 'Cieza', 38.2394, -1.4192, 15.6, 'Melocotonero', 'Mantenimiento', 4),
(1, 'La Vega Alta', 'Héctor G.', 'Archena', 38.1175, -1.2981, 10.2, 'Albaricoquero', 'Óptimo', 3);

-- INSERTAR ALGUNOS SENSORES DE EJEMPLO
INSERT INTO sensores (finca_id, nombre, tipo, modelo, ultima_lectura, unidad_medida) VALUES 
(1, 'Sensor Humedad Suelo A1', 'humedad', 'SoilWatch-V2', 45.5, '%'),
(1, 'Termómetro Ambiente', 'temperatura', 'DHT22', 22.4, '°C'),
(2, 'Caudalímetro Principal', 'caudal', 'YF-S201', 12.8, 'L/min'),
(5, 'Sensor Crítico Humedad', 'humedad', 'SoilWatch-V2', 12.0, '%');