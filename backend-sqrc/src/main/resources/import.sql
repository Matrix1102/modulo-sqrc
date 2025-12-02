-- ========================================
-- Índices FULLTEXT para búsqueda de texto completo
-- Este archivo se ejecuta automáticamente después de que Hibernate crea las tablas
-- cuando spring.jpa.hibernate.ddl-auto=create o create-drop
-- ========================================

-- FULLTEXT para búsqueda en articulos (titulo, resumen, tags)
ALTER TABLE articulos ADD FULLTEXT INDEX idx_fulltext_articulos (titulo, resumen, tags);

-- FULLTEXT para búsqueda en el contenido de las versiones
ALTER TABLE articulo_versiones ADD FULLTEXT INDEX idx_fulltext_contenido (contenido);

-- FULLTEXT para búsqueda en notas de cambio (opcional, útil para historial)
ALTER TABLE articulo_versiones ADD FULLTEXT INDEX idx_fulltext_nota_cambio (nota_cambio);
