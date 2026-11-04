CREATE DATABASE IF NOT EXISTS pequenos_exploradores DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pequenos_exploradores;

-- TABLA DE TUTORES / PADRES
CREATE TABLE IF NOT EXISTS tutores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ninos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    edad INT NOT NULL,
    grado_escolar VARCHAR(50) NOT NULL,
    genero VARCHAR(20) NOT NULL,
    estrellas INT DEFAULT 0,
    nivel INT DEFAULT 1,
    codigo_qr VARCHAR(100) NOT NULL UNIQUE,
    avatar VARCHAR(50) DEFAULT 'astronauta',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES tutores(id) ON DELETE CASCADE
);

-- TABLA DE HÁBITOS Y TAREAS DIARIAS
CREATE TABLE IF NOT EXISTS habitos_nino (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nino_id INT NOT NULL,
    habito_clave VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    completado TINYINT(1) DEFAULT 0,
    FOREIGN KEY (nino_id) REFERENCES ninos(id) ON DELETE CASCADE,
    UNIQUE KEY uq_habito_dia (nino_id, habito_clave, fecha)
);

-- TABLA DE RECOMPENSAS DESBLOQUEADAS
CREATE TABLE IF NOT EXISTS recompensas_nino (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nino_id INT NOT NULL,
    recompensa_id VARCHAR(50) NOT NULL,
    fecha_desbloqueo DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nino_id) REFERENCES ninos(id) ON DELETE CASCADE
);