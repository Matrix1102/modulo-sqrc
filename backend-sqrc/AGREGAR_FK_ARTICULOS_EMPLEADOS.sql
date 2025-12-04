-- ============================================================================
-- SCRIPT MANUAL: Agregar Foreign Keys de articulos/articulo_versiones a empleados y tickets
-- ============================================================================
-- Ejecutar este script directamente en la base de datos remota si no usas
-- migraciones automáticas de Flyway, o si necesitas aplicar los cambios
-- manualmente.
-- ============================================================================

-- ============================================================================
-- OPCIÓN 1: Script simplificado (si NO existen las FK actualmente)
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
-- OPCIÓN 2: Agregar índices (mejora rendimiento de JOINs)
-- ============================================================================

CREATE INDEX idx_articulo_creador ON articulos(id_creador);
CREATE INDEX idx_articulo_ultimo_editor ON articulos(id_ultimo_editor);
CREATE INDEX idx_version_creador ON articulo_versiones(id_creador);
CREATE INDEX idx_version_ticket ON articulo_versiones(id_ticket);

-- ============================================================================
-- CONSULTAS DE VERIFICACIÓN
-- ============================================================================

-- Verificar que las FK se crearon correctamente:
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME IN ('empleados', 'tickets')
AND TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('articulos', 'articulo_versiones');

-- Ver todas las FK de la tabla articulos:
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'articulos'
AND TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Ver todas las FK de la tabla articulo_versiones:
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'articulo_versiones'
AND TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- ============================================================================
-- CONSULTA ÚTIL: Obtener ticket desde documentación (JOIN)
-- ============================================================================
-- Ejemplo de cómo obtener el id_ticket asociado a una versión de artículo
-- a través de la tabla documentacion:
/*
SELECT 
    av.id_version,
    av.id_articulo,
    av.numero_version,
    av.id_ticket,
    t.asunto AS ticket_asunto,
    t.estado AS ticket_estado,
    d.problema,
    d.solucion
FROM articulo_versiones av
LEFT JOIN tickets t ON av.id_ticket = t.id_ticket
LEFT JOIN asignaciones a ON t.id_ticket = a.id_ticket  -- si existe relación
LEFT JOIN documentacion d ON a.id_asignacion = d.id_asignacion
WHERE av.origen = 'DERIVADO_DE_DOCUMENTACION';
*/
