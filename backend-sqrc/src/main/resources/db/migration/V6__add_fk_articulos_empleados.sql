-- ============================================================================
-- MIGRACIÓN: Agregar Foreign Keys de articulos y articulo_versiones a empleados
-- Módulo SQRC - Sistema de Solicitudes, Quejas, Reclamos y Consultas
-- ============================================================================
-- Este script agrega las relaciones de llaves foráneas entre las tablas
-- de artículos y la tabla empleados.
-- ============================================================================

-- ============================================================================
-- PASO 1: Verificar y eliminar FK existentes si las hubiera (para evitar errores)
-- ============================================================================

-- Eliminar FK de articulos si existen
SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'articulos' 
    AND CONSTRAINT_NAME = 'fk_articulo_creador'
);
SET @sql = IF(@fk_exists > 0, 
    'ALTER TABLE articulos DROP FOREIGN KEY fk_articulo_creador', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'articulos' 
    AND CONSTRAINT_NAME = 'fk_articulo_ultimo_editor'
);
SET @sql = IF(@fk_exists > 0, 
    'ALTER TABLE articulos DROP FOREIGN KEY fk_articulo_ultimo_editor', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Eliminar FK de articulo_versiones si existe
SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'articulo_versiones' 
    AND CONSTRAINT_NAME = 'fk_version_creador'
);
SET @sql = IF(@fk_exists > 0, 
    'ALTER TABLE articulo_versiones DROP FOREIGN KEY fk_version_creador', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Eliminar FK de articulo_versiones a tickets si existe
SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'articulo_versiones' 
    AND CONSTRAINT_NAME = 'fk_version_ticket'
);
SET @sql = IF(@fk_exists > 0, 
    'ALTER TABLE articulo_versiones DROP FOREIGN KEY fk_version_ticket', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- PASO 2: Agregar las Foreign Keys
-- ============================================================================

-- FK: articulos.id_creador -> empleados.id_empleado
ALTER TABLE articulos
ADD CONSTRAINT fk_articulo_creador 
    FOREIGN KEY (id_creador) REFERENCES empleados(id_empleado)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- FK: articulos.id_ultimo_editor -> empleados.id_empleado
ALTER TABLE articulos
ADD CONSTRAINT fk_articulo_ultimo_editor 
    FOREIGN KEY (id_ultimo_editor) REFERENCES empleados(id_empleado)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- FK: articulo_versiones.id_creador -> empleados.id_empleado
ALTER TABLE articulo_versiones
ADD CONSTRAINT fk_version_creador 
    FOREIGN KEY (id_creador) REFERENCES empleados(id_empleado)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- FK: articulo_versiones.id_ticket -> tickets.id_ticket
ALTER TABLE articulo_versiones
ADD CONSTRAINT fk_version_ticket 
    FOREIGN KEY (id_ticket) REFERENCES tickets(id_ticket)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- PASO 3: Agregar índices si no existen (para mejorar rendimiento de JOINs)
-- ============================================================================

-- Índice para id_creador en articulos
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'articulos' 
    AND INDEX_NAME = 'idx_articulo_creador'
);
SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_articulo_creador ON articulos(id_creador)', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para id_ultimo_editor en articulos
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'articulos' 
    AND INDEX_NAME = 'idx_articulo_ultimo_editor'
);
SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_articulo_ultimo_editor ON articulos(id_ultimo_editor)', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para id_creador en articulo_versiones
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'articulo_versiones' 
    AND INDEX_NAME = 'idx_version_creador'
);
SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_version_creador ON articulo_versiones(id_creador)', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para id_ticket en articulo_versiones
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'articulo_versiones' 
    AND INDEX_NAME = 'idx_version_ticket'
);
SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_version_ticket ON articulo_versiones(id_ticket)', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
