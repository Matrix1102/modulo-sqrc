-- ========================================
-- V7: Índices adicionales para rendimiento de Base de Conocimientos
-- ========================================

-- Índice compuesto para filtros comunes de búsqueda de artículos
-- Cubre: etiqueta + visibilidad + tipo_caso (los 3 filtros principales)
CREATE INDEX idx_articulo_filtros ON articulos(etiqueta, visibilidad, tipo_caso);

-- Índice para ordenamiento por fecha de actualización (muy usado en listados)
CREATE INDEX idx_articulo_fechas ON articulos(actualizado_en DESC, creado_en DESC);

-- Índice en articulo_versiones para consultas de versión vigente
CREATE INDEX idx_version_vigente ON articulo_versiones(id_articulo, es_vigente);

-- Índice compuesto para estado de propuesta + versión vigente
CREATE INDEX idx_version_estado_vigente ON articulo_versiones(estado_propuesta, es_vigente);

-- Índice para búsquedas por propietario (mis artículos)
CREATE INDEX idx_articulo_propietario ON articulos(id_creador);

-- Índice para consultas de feedback en versiones
CREATE INDEX idx_feedback_version ON feedback_articulos(id_version, util);
