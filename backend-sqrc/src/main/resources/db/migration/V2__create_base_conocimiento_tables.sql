-- ============================================================================
-- SCRIPT DE CREACIÓN DE TABLAS - BASE DE CONOCIMIENTO
-- Módulo SQRC - Sistema de Solicitudes, Quejas, Reclamos y Consultas
-- ============================================================================
-- Este script crea las tablas necesarias para la funcionalidad de
-- Base de Conocimientos y Asistencia Inteligente.
-- 
-- Ejecutar en MySQL 8.0 o superior
-- ============================================================================

-- Verificar y usar la base de datos correcta
-- USE sqrc_db;

-- ============================================================================
-- TABLA: articulos
-- Descripción: Almacena los artículos de la base de conocimientos
-- ============================================================================
CREATE TABLE IF NOT EXISTS articulos (
    id_articulo INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único del artículo (ej: KB-123456-ABCD)',
    titulo VARCHAR(255) NOT NULL COMMENT 'Título del artículo',
    resumen TEXT COMMENT 'Resumen o descripción breve del artículo',
    
    -- Enums como VARCHAR para flexibilidad
    etiqueta ENUM('GUIAS', 'POLITICAS', 'FAQS', 'CASOS', 'TROUBLESHOOTING', 'DESCRIPCIONES', 'INSTRUCTIVOS') 
        NOT NULL COMMENT 'Categoría/etiqueta del artículo',
    tipo_caso ENUM('SOLICITUD', 'QUEJA', 'RECLAMO', 'CONSULTA', 'TODOS') 
        DEFAULT 'TODOS' COMMENT 'Tipo de caso al que aplica',
    visibilidad ENUM('AGENTE', 'SUPERVISOR') 
        NOT NULL DEFAULT 'AGENTE' COMMENT 'Quién puede ver el artículo',
    
    -- Fechas de vigencia
    vigente_desde TIMESTAMP NULL COMMENT 'Fecha desde la cual el artículo está vigente',
    vigente_hasta TIMESTAMP NULL COMMENT 'Fecha hasta la cual el artículo está vigente',
    
    -- Relaciones con empleados
    id_creador INT NOT NULL COMMENT 'FK al empleado propietario/creador',
    id_ultimo_editor INT NULL COMMENT 'FK al último empleado que editó',
    
    -- Información adicional
    modulo VARCHAR(100) NULL COMMENT 'Módulo/área al que pertenece el artículo',
    
    -- Timestamps
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    actualizado_en TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- Índices
    INDEX idx_articulo_codigo (codigo),
    INDEX idx_articulo_etiqueta (etiqueta),
    INDEX idx_articulo_visibilidad (visibilidad),
    INDEX idx_articulo_tipo_caso (tipo_caso),
    INDEX idx_articulo_vigencia (vigente_desde, vigente_hasta),
    INDEX idx_articulo_creador (id_creador),
    
    -- Foreign Keys
    CONSTRAINT fk_articulo_creador 
        FOREIGN KEY (id_creador) REFERENCES empleados(id_empleado)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_articulo_ultimo_editor 
        FOREIGN KEY (id_ultimo_editor) REFERENCES empleados(id_empleado)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla principal de artículos de la base de conocimientos';


-- ============================================================================
-- TABLA: articulo_versiones
-- Descripción: Almacena las versiones de cada artículo (historial de cambios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS articulo_versiones (
    id_version INT AUTO_INCREMENT PRIMARY KEY,
    id_articulo INT NOT NULL COMMENT 'FK al artículo padre',
    numero_version INT NOT NULL COMMENT 'Número secuencial de la versión',
    contenido TEXT NOT NULL COMMENT 'Contenido completo del artículo en esta versión',
    nota_cambio VARCHAR(255) NULL COMMENT 'Descripción del cambio realizado',
    
    -- Relaciones
    id_creador INT NOT NULL COMMENT 'FK al empleado que creó esta versión',
    
    -- Estado y vigencia
    es_vigente BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Indica si es la versión activa',
    estado_propuesta ENUM('BORRADOR', 'PUBLICADO', 'ARCHIVADO', 'RECHAZADO') 
        NOT NULL DEFAULT 'BORRADOR' COMMENT 'Estado del ciclo de vida',
    
    -- Origen de la versión
    origen ENUM('MANUAL', 'DERIVADO_DE_DOCUMENTACION') 
        NOT NULL DEFAULT 'MANUAL' COMMENT 'Cómo se originó esta versión',
    id_ticket INT NULL COMMENT 'FK al ticket origen si fue derivado de documentación',
    
    -- Timestamps
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    
    -- Índices
    INDEX idx_version_articulo (id_articulo),
    INDEX idx_version_vigente (es_vigente),
    INDEX idx_version_estado (estado_propuesta),
    INDEX idx_version_origen (origen),
    INDEX idx_version_creador (id_creador),
    
    -- Constraints
    UNIQUE KEY uk_articulo_version (id_articulo, numero_version),
    
    -- Foreign Keys
    CONSTRAINT fk_version_articulo 
        FOREIGN KEY (id_articulo) REFERENCES articulos(id_articulo)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_version_creador 
        FOREIGN KEY (id_creador) REFERENCES empleados(id_empleado)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_version_ticket 
        FOREIGN KEY (id_ticket) REFERENCES tickets(id_ticket)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Versiones de artículos de conocimiento';


-- ============================================================================
-- TABLA: feedback_articulos
-- Descripción: Almacena el feedback/valoraciones de los artículos
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback_articulos (
    id_feedback INT AUTO_INCREMENT PRIMARY KEY,
    id_version INT NOT NULL COMMENT 'FK a la versión del artículo valorada',
    id_empleado BIGINT NOT NULL COMMENT 'FK al empleado que da el feedback',
    
    -- Datos del feedback
    comentario VARCHAR(500) NULL COMMENT 'Comentario opcional del empleado',
    calificacion TINYINT NULL COMMENT 'Calificación del 1 al 5',
    util BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Si el artículo fue útil',
    
    -- Timestamps
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del feedback',
    
    -- Índices
    INDEX idx_feedback_version (id_version),
    INDEX idx_feedback_empleado (id_empleado),
    INDEX idx_feedback_util (util),
    INDEX idx_feedback_calificacion (calificacion),
    
    -- Un empleado solo puede dar un feedback por versión
    UNIQUE KEY uk_feedback_empleado_version (id_version, id_empleado),
    
    -- Validaciones
    CONSTRAINT chk_calificacion CHECK (calificacion IS NULL OR (calificacion >= 1 AND calificacion <= 5)),
    
    -- Foreign Keys
    CONSTRAINT fk_feedback_version 
        FOREIGN KEY (id_version) REFERENCES articulo_versiones(id_version)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_feedback_empleado 
        FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Feedback y valoraciones de artículos de conocimiento';


-- ============================================================================
-- TABLA: articulo_vistas (opcional - para tracking de popularidad)
-- Descripción: Registra las visualizaciones de artículos
-- ============================================================================
CREATE TABLE IF NOT EXISTS articulo_vistas (
    id_vista INT AUTO_INCREMENT PRIMARY KEY,
    id_articulo INT NOT NULL COMMENT 'FK al artículo visualizado',
    id_empleado BIGINT NOT NULL COMMENT 'FK al empleado que visualizó',
    fecha_vista TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de la visualización',
    
    -- Índices
    INDEX idx_vista_articulo (id_articulo),
    INDEX idx_vista_empleado (id_empleado),
    INDEX idx_vista_fecha (fecha_vista),
    
    -- Foreign Keys
    CONSTRAINT fk_vista_articulo 
        FOREIGN KEY (id_articulo) REFERENCES articulos(id_articulo)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_vista_empleado 
        FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de visualizaciones de artículos (para métricas)';


-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista de artículos con información completa
CREATE OR REPLACE VIEW v_articulos_completos AS
SELECT 
    a.id_articulo,
    a.codigo,
    a.titulo,
    a.resumen,
    a.etiqueta,
    a.tipo_caso,
    a.visibilidad,
    a.vigente_desde,
    a.vigente_hasta,
    a.modulo,
    a.creado_en,
    a.actualizado_en,
    e_creador.id_empleado AS id_propietario,
    e_creador.nombre AS nombre_propietario,
    e_editor.id_empleado AS id_ultimo_editor,
    e_editor.nombre AS nombre_ultimo_editor,
    v.id_version AS id_version_vigente,
    v.numero_version AS version_vigente,
    v.contenido AS contenido_vigente,
    v.estado_propuesta AS estado_version_vigente,
    (SELECT COUNT(*) FROM articulo_versiones WHERE id_articulo = a.id_articulo) AS total_versiones,
    (SELECT COUNT(*) FROM feedback_articulos f 
     JOIN articulo_versiones av ON f.id_version = av.id_version 
     WHERE av.id_articulo = a.id_articulo AND f.util = TRUE) AS feedbacks_positivos,
    (SELECT AVG(f.calificacion) FROM feedback_articulos f 
     JOIN articulo_versiones av ON f.id_version = av.id_version 
     WHERE av.id_articulo = a.id_articulo AND f.calificacion IS NOT NULL) AS calificacion_promedio
FROM articulos a
LEFT JOIN empleados e_creador ON a.id_creador = e_creador.id_empleado
LEFT JOIN empleados e_editor ON a.id_ultimo_editor = e_editor.id_empleado
LEFT JOIN articulo_versiones v ON a.id_articulo = v.id_articulo AND v.es_vigente = TRUE;


-- Vista de artículos publicados y vigentes
CREATE OR REPLACE VIEW v_articulos_activos AS
SELECT 
    a.*,
    v.contenido,
    v.numero_version
FROM articulos a
JOIN articulo_versiones v ON a.id_articulo = v.id_articulo
WHERE v.es_vigente = TRUE
  AND v.estado_propuesta = 'PUBLICADO'
  AND (a.vigente_desde IS NULL OR a.vigente_desde <= NOW())
  AND (a.vigente_hasta IS NULL OR a.vigente_hasta >= NOW());


-- ============================================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================================================

-- Insertar artículo de ejemplo (comentado por defecto)
/*
INSERT INTO articulos (codigo, titulo, resumen, etiqueta, tipo_caso, visibilidad, id_creador)
VALUES 
    ('KB-001-DEMO', 'Solicitud de soporte', 
     'Si tienes alguna pregunta sobre cualquiera de los productos o servicios que has adquirido, puedes usar el portal de soporte para solicitar ayuda.',
     'GUIAS', 'TODOS', 'AGENTE', 1);

INSERT INTO articulo_versiones (id_articulo, numero_version, contenido, nota_cambio, id_creador, es_vigente, estado_propuesta)
VALUES 
    (1, 1, 
     '# Solicitud de soporte\n\n## Propósito y alcance\n\nSi tienes alguna pregunta sobre cualquiera de los productos o servicios que has adquirido, puedes usar el portal de soporte para solicitar ayuda.\n\n## Procedimiento\n\n1. En el portal, haz clic en Soporte > Enviar un caso.\n2. Completa tu nombre, información de contacto, nombre del producto y número de pedido.\n3. En el menú desplegable Categoría del caso, selecciona la categoría que mejor describa el problema que estás experimentando.\n\n## Comentarios adicionales\n\nUna vez que tu solicitud de soporte haya sido enviada, recibirás una comunicación de seguimiento del equipo de soporte.\nPuedes agregar cualquier nota o información adicional haciendo clic en el caso desde la pantalla Mis Casos.',
     'Versión inicial', 1, TRUE, 'PUBLICADO');
*/


-- ============================================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ============================================================================

DELIMITER //

-- Procedimiento para publicar una versión de artículo
CREATE PROCEDURE IF NOT EXISTS sp_publicar_version(
    IN p_id_version INT,
    IN p_visibilidad VARCHAR(15)
)
BEGIN
    DECLARE v_id_articulo INT;
    
    -- Obtener el artículo de la versión
    SELECT id_articulo INTO v_id_articulo 
    FROM articulo_versiones 
    WHERE id_version = p_id_version;
    
    -- Desmarcar todas las versiones vigentes del artículo
    UPDATE articulo_versiones 
    SET es_vigente = FALSE 
    WHERE id_articulo = v_id_articulo;
    
    -- Marcar la nueva versión como vigente
    UPDATE articulo_versiones 
    SET es_vigente = TRUE, 
        estado_propuesta = 'PUBLICADO' 
    WHERE id_version = p_id_version;
    
    -- Actualizar la visibilidad del artículo
    UPDATE articulos 
    SET visibilidad = p_visibilidad,
        actualizado_en = NOW()
    WHERE id_articulo = v_id_articulo;
    
END //

-- Procedimiento para archivar versiones antiguas
CREATE PROCEDURE IF NOT EXISTS sp_archivar_versiones_antiguas(
    IN p_id_articulo INT,
    IN p_mantener_ultimas INT
)
BEGIN
    UPDATE articulo_versiones 
    SET estado_propuesta = 'ARCHIVADO'
    WHERE id_articulo = p_id_articulo 
      AND es_vigente = FALSE
      AND estado_propuesta = 'PUBLICADO'
      AND id_version NOT IN (
          SELECT id_version FROM (
              SELECT id_version 
              FROM articulo_versiones 
              WHERE id_articulo = p_id_articulo
              ORDER BY numero_version DESC
              LIMIT p_mantener_ultimas
          ) AS subquery
      );
END //

DELIMITER ;


-- ============================================================================
-- TRIGGERS
-- ============================================================================

DELIMITER //

-- Trigger para actualizar la fecha de actualización del artículo al crear versión
CREATE TRIGGER IF NOT EXISTS trg_version_update_articulo
AFTER INSERT ON articulo_versiones
FOR EACH ROW
BEGIN
    UPDATE articulos 
    SET actualizado_en = NOW(),
        id_ultimo_editor = NEW.id_creador
    WHERE id_articulo = NEW.id_articulo;
END //

DELIMITER ;


-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
