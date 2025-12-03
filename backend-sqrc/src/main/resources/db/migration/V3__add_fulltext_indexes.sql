-- ========================================
-- V3: Agregar índices FULLTEXT para búsqueda de texto completo
-- ========================================
-- Estos índices permiten usar MATCH AGAINST para búsquedas eficientes
-- en la base de conocimientos

-- Primero eliminar el índice simple de tags si existe (V2 lo creó solo para tags)
-- Lo reemplazamos por uno combinado más potente
DROP INDEX idx_articulo_tags ON articulos;

-- Índice FULLTEXT en articulos (titulo, resumen, tags)
-- Permite búsqueda combinada en estos 3 campos
ALTER TABLE articulos ADD FULLTEXT INDEX idx_fulltext_articulos (titulo, resumen, tags);

-- Índice FULLTEXT en articulo_versiones (contenido)
-- Para búsqueda en el contenido completo del artículo
ALTER TABLE articulo_versiones ADD FULLTEXT INDEX idx_fulltext_contenido (contenido);

-- Índice FULLTEXT en articulo_versiones (nota_cambio)
-- Para búsqueda en las notas de cambio/historial
ALTER TABLE articulo_versiones ADD FULLTEXT INDEX idx_fulltext_nota_cambio (nota_cambio);
