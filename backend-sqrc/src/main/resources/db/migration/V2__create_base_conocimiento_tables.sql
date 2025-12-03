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
    tags VARCHAR(500) NULL COMMENT 'Palabras clave separadas por comas (ej: 4g, roaming, fibra)',
    
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
    FULLTEXT INDEX idx_articulo_tags (tags),
    
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
    a.tags,
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


-- ============================================================================
-- DATOS DE PRUEBA - BASE DE CONOCIMIENTO
-- ============================================================================
-- Insertar empleados de prueba (si no existen)
INSERT INTO empleados (id_empleado, nombre, correo, telefono, puesto) VALUES
(1, 'Carlos Mendoza', 'carlos.mendoza@empresa.com', '987654321', 'Agente Senior'),
(2, 'María García', 'maria.garcia@empresa.com', '987654322', 'Supervisora'),
(3, 'Juan Pérez', 'juan.perez@empresa.com', '987654323', 'Agente'),
(4, 'Ana López', 'ana.lopez@empresa.com', '987654324', 'Especialista Técnico'),
(5, 'Roberto Sánchez', 'roberto.sanchez@empresa.com', '987654325', 'Supervisor Técnico')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ============================================================================
-- ARTÍCULOS DE BASE DE CONOCIMIENTO
-- ============================================================================

-- Artículo 1: Configuración 4G/LTE
INSERT INTO articulos (codigo, titulo, resumen, etiqueta, tipo_caso, visibilidad, vigente_desde, vigente_hasta, id_creador, tags, creado_en) VALUES
('KB-001-4G', 
 'Configuración de Red 4G/LTE en Dispositivos Móviles', 
 'Guía paso a paso para configurar la conexión 4G/LTE en smartphones Android e iOS.',
 'GUIAS', 'CONSULTA', 'AGENTE', 
 '2025-01-01 00:00:00', '2026-12-31 23:59:59', 
 1,
 '4g, lte, configuración, android, ios, datos móviles, internet móvil, apn',
 NOW());

-- Artículo 2: Roaming Internacional
INSERT INTO articulos (codigo, titulo, resumen, etiqueta, tipo_caso, visibilidad, vigente_desde, vigente_hasta, id_creador, tags, creado_en) VALUES
('KB-002-ROAM', 
 'Activación y Uso del Roaming Internacional', 
 'Procedimiento para activar el servicio de roaming y tarifas aplicables por zona.',
 'POLITICAS', 'SOLICITUD', 'SUPERVISOR', 
 '2025-01-01 00:00:00', '2026-06-30 23:59:59', 
 2,
 'roaming, internacional, viajes, tarifas, activación, exterior, llamadas internacionales',
 NOW());

-- Artículo 3: Fibra Óptica - Troubleshooting
INSERT INTO articulos (codigo, titulo, resumen, etiqueta, tipo_caso, visibilidad, vigente_desde, vigente_hasta, id_creador, tags, creado_en) VALUES
('KB-003-FIBRA', 
 'Solución de Problemas de Conexión Fibra Óptica', 
 'Diagnóstico y solución de problemas comunes en servicios de fibra óptica residencial.',
 'TROUBLESHOOTING', 'RECLAMO', 'AGENTE', 
 '2025-02-01 00:00:00', NULL, 
 4,
 'fibra óptica, ftth, lentitud, desconexión, router, ont, modem, wifi, velocidad',
 NOW());

-- Artículo 4: Portabilidad Numérica
INSERT INTO articulos (codigo, titulo, resumen, etiqueta, tipo_caso, visibilidad, vigente_desde, vigente_hasta, id_creador, tags, creado_en) VALUES
('KB-004-PORT', 
 'Proceso de Portabilidad Numérica', 
 'Requisitos y pasos para realizar la portabilidad de número desde otros operadores.',
 'INSTRUCTIVOS', 'SOLICITUD', 'AGENTE', 
 '2025-01-15 00:00:00', '2026-12-31 23:59:59', 
 3,
 'portabilidad, cambio de operador, número, migración, claro, movistar, entel, bitel',
 NOW());

-- Artículo 5: Facturación y Pagos
INSERT INTO articulos (codigo, titulo, resumen, etiqueta, tipo_caso, visibilidad, vigente_desde, vigente_hasta, id_creador, tags, creado_en) VALUES
('KB-005-FACT', 
 'Consultas Frecuentes sobre Facturación', 
 'Respuestas a las preguntas más comunes sobre facturación, pagos y estados de cuenta.',
 'FAQS', 'QUEJA', 'AGENTE', 
 '2025-01-01 00:00:00', NULL, 
 2,
 'factura, pago, recibo, deuda, mora, pronto pago, descuento, cuota, mensualidad',
 NOW());

-- Artículo 6: Planes Postpago Empresariales
INSERT INTO articulos (codigo, titulo, resumen, etiqueta, tipo_caso, visibilidad, vigente_desde, vigente_hasta, id_creador, tags, creado_en) VALUES
('KB-006-CORP', 
 'Planes Postpago para Empresas', 
 'Descripción de planes corporativos, beneficios y requisitos de contratación.',
 'DESCRIPCIONES', 'CONSULTA', 'SUPERVISOR', 
 '2025-03-01 00:00:00', '2025-12-31 23:59:59', 
 5,
 'postpago, empresas, corporativo, flotas, ruc, planes, beneficios, descuentos volumen',
 NOW());

-- Artículo 7: 5G Cobertura y Compatibilidad
INSERT INTO articulos (codigo, titulo, resumen, etiqueta, tipo_caso, visibilidad, vigente_desde, vigente_hasta, id_creador, tags, creado_en) VALUES
('KB-007-5G', 
 'Red 5G: Cobertura y Dispositivos Compatibles', 
 'Información sobre la cobertura 5G actual y lista de dispositivos compatibles.',
 'GUIAS', 'CONSULTA', 'AGENTE', 
 '2025-06-01 00:00:00', NULL, 
 1,
 '5g, cobertura, compatibilidad, velocidad, latencia, smartphone, samsung, iphone, huawei',
 NOW());

-- Artículo 8: Casos de Fraude y Seguridad
INSERT INTO articulos (codigo, titulo, resumen, etiqueta, tipo_caso, visibilidad, vigente_desde, vigente_hasta, id_creador, tags, creado_en) VALUES
('KB-008-FRAUD', 
 'Protocolo de Atención de Casos de Fraude', 
 'Procedimiento interno para gestionar casos de fraude, SIM swapping y robo de identidad.',
 'CASOS', 'RECLAMO', 'SUPERVISOR', 
 '2025-01-01 00:00:00', NULL, 
 5,
 'fraude, sim swapping, robo, identidad, seguridad, bloqueo, suplantación, phishing',
 NOW());


-- ============================================================================
-- VERSIONES DE ARTÍCULOS
-- ============================================================================

-- Versiones para Artículo 1 (4G/LTE) - 3 versiones
INSERT INTO articulo_versiones (id_articulo, numero_version, contenido, nota_cambio, id_creador, es_vigente, estado_propuesta, origen, creado_en) VALUES
(1, 1, 
'<h2>Configuración de Red 4G/LTE</h2>
<h3>Para Android:</h3>
<ol>
<li>Ir a Configuración > Conexiones > Redes móviles</li>
<li>Seleccionar "Modo de red"</li>
<li>Elegir "LTE/3G/2G (conexión automática)"</li>
</ol>
<h3>Para iOS:</h3>
<ol>
<li>Ir a Configuración > Datos móviles > Opciones</li>
<li>Seleccionar "Voz y datos"</li>
<li>Elegir "LTE"</li>
</ol>',
'Versión inicial con configuración básica', 1, FALSE, 'ARCHIVADO', 'MANUAL', NOW()),

(1, 2, 
'<h2>Configuración de Red 4G/LTE</h2>
<h3>Para Android (versión 10+):</h3>
<ol>
<li>Ir a Configuración > Conexiones > Redes móviles</li>
<li>Seleccionar "Modo de red"</li>
<li>Elegir "LTE/3G/2G (conexión automática)"</li>
<li>Verificar que APN esté configurado correctamente</li>
</ol>
<h3>Para iOS (iPhone 8 en adelante):</h3>
<ol>
<li>Ir a Configuración > Datos móviles > Opciones</li>
<li>Seleccionar "Voz y datos"</li>
<li>Elegir "LTE" o "5G automático"</li>
</ol>
<h3>APN recomendado:</h3>
<p>Nombre: internet.empresa.pe | Usuario: (vacío) | Contraseña: (vacío)</p>',
'Actualización con configuración APN y versiones de OS', 4, FALSE, 'PUBLICADO', 'MANUAL', NOW()),

(1, 3, 
'<h2>Configuración de Red 4G/LTE - Guía Completa</h2>
<h3>Requisitos previos:</h3>
<ul>
<li>SIM compatible con 4G/LTE</li>
<li>Dispositivo con soporte 4G</li>
<li>Cobertura 4G en la zona</li>
</ul>
<h3>Para Android (versión 10+):</h3>
<ol>
<li>Ir a Configuración > Conexiones > Redes móviles</li>
<li>Seleccionar "Modo de red"</li>
<li>Elegir "LTE/3G/2G (conexión automática)"</li>
<li>Verificar que APN esté configurado correctamente</li>
</ol>
<h3>Para iOS (iPhone 8 en adelante):</h3>
<ol>
<li>Ir a Configuración > Datos móviles > Opciones</li>
<li>Seleccionar "Voz y datos"</li>
<li>Elegir "LTE" o "5G automático"</li>
</ol>
<h3>Configuración APN:</h3>
<table>
<tr><td>Nombre:</td><td>internet.empresa.pe</td></tr>
<tr><td>APN:</td><td>internet.empresa.pe</td></tr>
<tr><td>Usuario:</td><td>(vacío)</td></tr>
<tr><td>Contraseña:</td><td>(vacío)</td></tr>
<tr><td>Tipo de autenticación:</td><td>Ninguna</td></tr>
</table>
<h3>Solución de problemas:</h3>
<p>Si no conecta, reiniciar el dispositivo y verificar la cobertura en la app Mi Empresa.</p>',
'Versión completa con requisitos y solución de problemas', 1, TRUE, 'PUBLICADO', 'MANUAL', NOW());

-- Versiones para Artículo 2 (Roaming) - 2 versiones
INSERT INTO articulo_versiones (id_articulo, numero_version, contenido, nota_cambio, id_creador, es_vigente, estado_propuesta, origen, creado_en) VALUES
(2, 1, 
'<h2>Roaming Internacional</h2>
<h3>Activación:</h3>
<p>Llamar al *123# o desde la app Mi Empresa.</p>
<h3>Tarifas:</h3>
<ul>
<li>Zona 1 (Sudamérica): $1.50/min llamadas, $0.50/MB datos</li>
<li>Zona 2 (Norteamérica/Europa): $2.50/min llamadas, $1.00/MB datos</li>
<li>Zona 3 (Asia/Oceanía): $3.50/min llamadas, $1.50/MB datos</li>
</ul>',
'Versión inicial', 2, FALSE, 'PUBLICADO', 'MANUAL', NOW()),

(2, 2, 
'<h2>Roaming Internacional - Política y Tarifas 2025</h2>
<h3>¿Cómo activar el roaming?</h3>
<ol>
<li>Desde la app Mi Empresa: Servicios > Roaming > Activar</li>
<li>Marcando *123*1# desde tu línea</li>
<li>Llamando a atención al cliente 24/7</li>
</ol>
<h3>Requisitos:</h3>
<ul>
<li>Línea activa con antigüedad mínima de 3 meses</li>
<li>Sin deuda pendiente</li>
<li>Depósito de garantía según historial crediticio</li>
</ul>
<h3>Tarifas por zona (vigentes desde Enero 2025):</h3>
<table>
<tr><th>Zona</th><th>Países</th><th>Llamadas/min</th><th>Datos/MB</th><th>SMS</th></tr>
<tr><td>1</td><td>Chile, Colombia, Ecuador, Bolivia</td><td>$1.20</td><td>$0.40</td><td>$0.30</td></tr>
<tr><td>2</td><td>USA, Canadá, España, Italia, Francia</td><td>$2.00</td><td>$0.80</td><td>$0.50</td></tr>
<tr><td>3</td><td>Japón, China, Australia, Emiratos</td><td>$3.00</td><td>$1.20</td><td>$0.80</td></tr>
</table>
<h3>Paquetes de roaming (recomendados):</h3>
<ul>
<li>Pack Viajero 3 días: 1GB + 30 min llamadas = $25</li>
<li>Pack Viajero 7 días: 3GB + 60 min llamadas = $50</li>
<li>Pack Viajero 15 días: 5GB + 120 min llamadas = $80</li>
</ul>',
'Actualización de tarifas 2025 y nuevos paquetes', 2, TRUE, 'PUBLICADO', 'MANUAL', NOW());

-- Versiones para Artículo 3 (Fibra) - 2 versiones
INSERT INTO articulo_versiones (id_articulo, numero_version, contenido, nota_cambio, id_creador, es_vigente, estado_propuesta, origen, creado_en) VALUES
(3, 1, 
'<h2>Troubleshooting Fibra Óptica</h2>
<h3>Problema: Sin conexión a internet</h3>
<ol>
<li>Verificar luz PON del ONT (debe estar verde fija)</li>
<li>Reiniciar ONT y router desconectando 30 segundos</li>
<li>Verificar cables de fibra no estén doblados</li>
<li>Si persiste, escalar a soporte técnico nivel 2</li>
</ol>',
'Versión inicial', 4, FALSE, 'ARCHIVADO', 'MANUAL', NOW()),

(3, 2, 
'<h2>Solución de Problemas - Fibra Óptica Residencial</h2>
<h3>Diagnóstico inicial:</h3>
<p>Verificar indicadores LED del ONT:</p>
<ul>
<li><strong>POWER:</strong> Verde = OK, Apagado = Sin energía</li>
<li><strong>PON:</strong> Verde fijo = Conexión OK, Parpadeando = Sincronizando, Rojo = Sin señal óptica</li>
<li><strong>LAN:</strong> Verde = Puerto activo</li>
<li><strong>INTERNET:</strong> Verde = IP asignada, Rojo = Sin autenticación</li>
</ul>

<h3>Problema 1: Sin conexión total</h3>
<ol>
<li>Verificar que el ONT tenga energía (luz POWER encendida)</li>
<li>Verificar luz PON - si está roja o apagada, revisar conexión de fibra</li>
<li>Reiniciar ONT desconectando 30 segundos</li>
<li>Si PON sigue roja, verificar que el cable de fibra no esté doblado o dañado</li>
<li>Escalar a técnico de campo si el problema persiste</li>
</ol>

<h3>Problema 2: Velocidad lenta</h3>
<ol>
<li>Realizar test de velocidad en fast.com conectado por cable</li>
<li>Verificar que no haya otros dispositivos consumiendo ancho de banda</li>
<li>Cambiar canal WiFi si hay interferencia (usar app WiFi Analyzer)</li>
<li>Verificar plan contratado vs velocidad medida</li>
<li>Si es menor al 80% del plan, escalar a NOC</li>
</ol>

<h3>Problema 3: Cortes intermitentes</h3>
<ol>
<li>Revisar historial de cortes en el sistema de monitoreo</li>
<li>Verificar si hay trabajos programados en la zona</li>
<li>Revisar conexiones físicas en la roseta óptica</li>
<li>Programar visita técnica si hay más de 3 cortes en una semana</li>
</ol>

<h3>Códigos de escalamiento:</h3>
<ul>
<li>ESC-NOC-001: Problema de señal óptica</li>
<li>ESC-NOC-002: Problema de velocidad</li>
<li>ESC-CAMPO-001: Revisión de acometida</li>
</ul>',
'Guía completa de troubleshooting con códigos de escalamiento', 4, TRUE, 'PUBLICADO', 'MANUAL', NOW());

-- Versiones para Artículo 4 (Portabilidad) - 1 versión
INSERT INTO articulo_versiones (id_articulo, numero_version, contenido, nota_cambio, id_creador, es_vigente, estado_propuesta, origen, creado_en) VALUES
(4, 1, 
'<h2>Portabilidad Numérica - Proceso Completo</h2>

<h3>¿Qué es la portabilidad?</h3>
<p>Es el derecho que tienen los usuarios de telefonía móvil de cambiar de operador manteniendo su número telefónico.</p>

<h3>Requisitos:</h3>
<ul>
<li>DNI vigente del titular de la línea</li>
<li>Línea activa (no suspendida por deuda mayor a 60 días)</li>
<li>No haber portado en los últimos 6 meses</li>
<li>Recibo o constancia del operador actual</li>
</ul>

<h3>Proceso paso a paso:</h3>
<ol>
<li><strong>Validación (Día 0):</strong> Verificar requisitos y elegibilidad del cliente</li>
<li><strong>Registro (Día 0):</strong> Ingresar solicitud en sistema SIPORT</li>
<li><strong>Confirmación (Día 1-2):</strong> Cliente recibe SMS de confirmación</li>
<li><strong>Ventana de portabilidad (Día 7):</strong> Se ejecuta el cambio entre las 00:00 y 06:00 hrs</li>
<li><strong>Activación (Día 7):</strong> Cliente debe insertar nueva SIM y reiniciar</li>
</ol>

<h3>Estados en sistema:</h3>
<ul>
<li><strong>PENDIENTE:</strong> Solicitud registrada</li>
<li><strong>EN_PROCESO:</strong> Aprobada por operador cedente</li>
<li><strong>RECHAZADA:</strong> Verificar motivo en sistema</li>
<li><strong>COMPLETADA:</strong> Portabilidad exitosa</li>
</ul>

<h3>Motivos comunes de rechazo:</h3>
<ul>
<li>Deuda pendiente mayor a 60 días</li>
<li>Línea con contrato vigente con penalidad</li>
<li>Datos incorrectos del titular</li>
<li>Portabilidad reciente (< 6 meses)</li>
</ul>

<h3>Tiempo máximo:</h3>
<p>7 días hábiles desde la solicitud según regulación OSIPTEL.</p>',
'Versión inicial completa', 3, TRUE, 'PUBLICADO', 'MANUAL', NOW());

-- Versiones para Artículo 5 (Facturación) - 2 versiones
INSERT INTO articulo_versiones (id_articulo, numero_version, contenido, nota_cambio, id_creador, es_vigente, estado_propuesta, origen, creado_en) VALUES
(5, 1, 
'<h2>FAQ Facturación</h2>
<h3>¿Cuándo llega mi recibo?</h3>
<p>El recibo se emite el día 15 de cada mes.</p>
<h3>¿Cómo pago?</h3>
<p>Puede pagar en bancos, agentes o la app.</p>',
'Versión inicial básica', 2, FALSE, 'ARCHIVADO', 'MANUAL', NOW()),

(5, 2, 
'<h2>Preguntas Frecuentes - Facturación y Pagos</h2>

<h3>1. ¿Cuándo se emite mi recibo?</h3>
<p>Los recibos se emiten según el ciclo de facturación asignado:</p>
<ul>
<li>Ciclo 1: día 5 de cada mes</li>
<li>Ciclo 2: día 15 de cada mes</li>
<li>Ciclo 3: día 25 de cada mes</li>
</ul>

<h3>2. ¿Cuáles son los medios de pago disponibles?</h3>
<ul>
<li><strong>App Mi Empresa:</strong> Pago con tarjeta, débito automático</li>
<li><strong>Bancos:</strong> BCP, BBVA, Interbank, Scotiabank (ventanilla, app, web)</li>
<li><strong>Agentes:</strong> Kasnet, Tambo, Mass, bodegas autorizadas</li>
<li><strong>Pago en línea:</strong> www.empresa.pe/pagos</li>
<li><strong>Débito automático:</strong> Configurar en app o llamando al *123#</li>
</ul>

<h3>3. ¿Qué pasa si no pago a tiempo?</h3>
<table>
<tr><th>Días de mora</th><th>Acción</th></tr>
<tr><td>1-15 días</td><td>Cobro de interés moratorio (1.5% mensual)</td></tr>
<tr><td>16-30 días</td><td>Suspensión parcial (solo llamadas entrantes)</td></tr>
<tr><td>31-60 días</td><td>Suspensión total del servicio</td></tr>
<tr><td>+60 días</td><td>Baja definitiva y reporte a centrales de riesgo</td></tr>
</table>

<h3>4. ¿Cómo obtengo descuento por pronto pago?</h3>
<p>Pagando hasta 5 días después de la emisión del recibo, obtiene 5% de descuento en el cargo fijo.</p>

<h3>5. ¿Cómo solicito factura electrónica?</h3>
<ol>
<li>Ingresar a la app Mi Empresa</li>
<li>Ir a Configuración > Facturación</li>
<li>Activar "Recibir factura por email"</li>
<li>Ingresar el correo donde desea recibirla</li>
</ol>

<h3>6. ¿Cómo reclamo un cobro indebido?</h3>
<p>Tiene 30 días desde la emisión para reclamar. Puede hacerlo:</p>
<ul>
<li>App: Soporte > Reclamos > Nuevo reclamo</li>
<li>Web: www.empresa.pe/reclamos</li>
<li>Libro de reclamaciones en cualquier tienda</li>
</ul>',
'FAQ completo con todos los escenarios', 2, TRUE, 'PUBLICADO', 'MANUAL', NOW());

-- Versiones para Artículo 6 (Planes Corporativos) - 1 versión
INSERT INTO articulo_versiones (id_articulo, numero_version, contenido, nota_cambio, id_creador, es_vigente, estado_propuesta, origen, creado_en) VALUES
(6, 1, 
'<h2>Planes Postpago Empresariales 2025</h2>

<h3>Requisitos para contratar:</h3>
<ul>
<li>RUC activo y habido</li>
<li>Antigüedad mínima de la empresa: 1 año</li>
<li>Mínimo 5 líneas para plan flota</li>
<li>Carta de autorización del representante legal</li>
<li>Última declaración de impuestos</li>
</ul>

<h3>Planes disponibles:</h3>
<table>
<tr><th>Plan</th><th>Datos</th><th>Minutos</th><th>Beneficios</th><th>Precio/línea</th></tr>
<tr><td>Empresarial Básico</td><td>10 GB</td><td>Ilimitados</td><td>Llamadas a flota gratis</td><td>S/ 59</td></tr>
<tr><td>Empresarial Plus</td><td>25 GB</td><td>Ilimitados</td><td>+ Roaming Latam</td><td>S/ 89</td></tr>
<tr><td>Empresarial Premium</td><td>50 GB</td><td>Ilimitados</td><td>+ 5G + Roaming Global</td><td>S/ 129</td></tr>
<tr><td>Empresarial Unlimited</td><td>Ilimitados</td><td>Ilimitados</td><td>Todo incluido + Soporte VIP</td><td>S/ 199</td></tr>
</table>

<h3>Descuentos por volumen:</h3>
<ul>
<li>5-10 líneas: 10% descuento</li>
<li>11-25 líneas: 15% descuento</li>
<li>26-50 líneas: 20% descuento</li>
<li>+50 líneas: Negociación directa con ejecutivo</li>
</ul>

<h3>Servicios adicionales:</h3>
<ul>
<li>MDM (Mobile Device Management): S/ 15/línea</li>
<li>Seguro de equipos: S/ 10/línea</li>
<li>Líneas de respaldo: S/ 25/línea</li>
<li>Reportes de consumo: Incluido</li>
</ul>

<h3>Proceso de contratación:</h3>
<ol>
<li>Contactar ejecutivo corporativo</li>
<li>Enviar documentación requerida</li>
<li>Evaluación crediticia (24-48 hrs)</li>
<li>Firma de contrato</li>
<li>Entrega de equipos y SIMs (3-5 días)</li>
</ol>',
'Versión inicial con planes 2025', 5, TRUE, 'PUBLICADO', 'MANUAL', NOW());

-- Versiones para Artículo 7 (5G) - 3 versiones
INSERT INTO articulo_versiones (id_articulo, numero_version, contenido, nota_cambio, id_creador, es_vigente, estado_propuesta, origen, creado_en) VALUES
(7, 1, 
'<h2>Red 5G - Información Inicial</h2>
<p>Próximamente disponible en Lima Metropolitana.</p>
<p>Dispositivos compatibles: iPhone 12+, Samsung S21+</p>',
'Versión inicial - lanzamiento 5G', 1, FALSE, 'ARCHIVADO', 'MANUAL', NOW()),

(7, 2, 
'<h2>Red 5G - Cobertura Inicial</h2>
<h3>Zonas con cobertura:</h3>
<ul>
<li>Miraflores</li>
<li>San Isidro</li>
<li>San Borja</li>
</ul>
<h3>Dispositivos compatibles:</h3>
<ul>
<li>iPhone 12, 13, 14, 15</li>
<li>Samsung Galaxy S21, S22, S23, S24</li>
<li>Xiaomi 12, 13, 14</li>
</ul>',
'Actualización con zonas de cobertura', 1, FALSE, 'PUBLICADO', 'MANUAL', NOW()),

(7, 3, 
'<h2>Red 5G - Cobertura y Dispositivos Compatibles</h2>

<h3>¿Qué es 5G?</h3>
<p>La quinta generación de tecnología móvil que ofrece velocidades hasta 20x más rápidas que 4G, menor latencia y mayor capacidad de conexiones simultáneas.</p>

<h3>Beneficios del 5G:</h3>
<ul>
<li><strong>Velocidad:</strong> Hasta 1 Gbps de descarga</li>
<li><strong>Latencia:</strong> Menos de 10ms (ideal para gaming y videollamadas)</li>
<li><strong>Capacidad:</strong> Más dispositivos conectados sin afectar velocidad</li>
</ul>

<h3>Cobertura actual (Diciembre 2025):</h3>
<h4>Lima Metropolitana:</h4>
<ul>
<li>Miraflores (100%)</li>
<li>San Isidro (100%)</li>
<li>San Borja (100%)</li>
<li>Surco (80%)</li>
<li>La Molina (70%)</li>
<li>Barranco (100%)</li>
<li>Pueblo Libre (60%)</li>
</ul>

<h4>Provincias:</h4>
<ul>
<li>Arequipa - Centro y Cayma</li>
<li>Trujillo - Centro histórico</li>
<li>Piura - Centro</li>
</ul>

<h3>Dispositivos compatibles:</h3>
<table>
<tr><th>Marca</th><th>Modelos</th></tr>
<tr><td>Apple</td><td>iPhone 12, 12 Pro, 13, 13 Pro, 14, 14 Pro, 15, 15 Pro</td></tr>
<tr><td>Samsung</td><td>Galaxy S21/S21+/S21 Ultra, S22 series, S23 series, S24 series, Z Fold 3/4/5, Z Flip 3/4/5</td></tr>
<tr><td>Xiaomi</td><td>Mi 11, 12, 13, 14, Redmi Note 12 Pro+ 5G</td></tr>
<tr><td>Huawei</td><td>P50 Pro, Mate 50, Nova 11</td></tr>
<tr><td>Motorola</td><td>Edge 30, 40, 50 series</td></tr>
<tr><td>OnePlus</td><td>9, 10, 11, 12</td></tr>
</table>

<h3>¿Cómo activar 5G?</h3>
<ol>
<li>Verificar que tu dispositivo sea compatible</li>
<li>Verificar cobertura 5G en tu zona (app Mi Empresa)</li>
<li>Ir a Configuración > Redes móviles > Modo de red</li>
<li>Seleccionar "5G/LTE/3G/2G automático"</li>
<li>Si no aparece 5G, actualizar configuración de operador</li>
</ol>

<h3>¿Tiene costo adicional?</h3>
<p>No. El acceso a la red 5G está incluido en todos los planes postpago sin costo adicional. Solo necesitas un dispositivo compatible.</p>

<h3>Mapa de cobertura:</h3>
<p>Consulta el mapa interactivo en: www.empresa.pe/cobertura5g</p>',
'Versión completa con cobertura actualizada Diciembre 2025', 1, TRUE, 'PUBLICADO', 'MANUAL', NOW());

-- Versiones para Artículo 8 (Fraude) - 1 versión
INSERT INTO articulo_versiones (id_articulo, numero_version, contenido, nota_cambio, id_creador, es_vigente, estado_propuesta, origen, creado_en) VALUES
(8, 1, 
'<h2>Protocolo de Atención de Casos de Fraude</h2>

<h3>⚠️ DOCUMENTO CONFIDENCIAL - SOLO SUPERVISORES</h3>

<h3>Tipos de fraude más comunes:</h3>
<ol>
<li><strong>SIM Swapping:</strong> Suplantación para obtener SIM duplicada</li>
<li><strong>Robo de identidad:</strong> Contratación con documentos falsos</li>
<li><strong>Fraude interno:</strong> Activaciones irregulares por empleados</li>
<li><strong>Phishing:</strong> Obtención de datos por engaño</li>
</ol>

<h3>Protocolo de actuación inmediata:</h3>
<ol>
<li><strong>Bloqueo preventivo:</strong> Bloquear línea inmediatamente con código FRD-001</li>
<li><strong>Documentación:</strong> Registrar todos los detalles en ticket tipo FRAUDE</li>
<li><strong>Escalamiento:</strong> Notificar a Seguridad Corporativa en menos de 1 hora</li>
<li><strong>Preservación:</strong> No modificar registros, se requieren para investigación</li>
</ol>

<h3>Validaciones obligatorias para SIM duplicada:</h3>
<ul>
<li>✓ DNI físico original del titular</li>
<li>✓ Validación biométrica (huella dactilar)</li>
<li>✓ Pregunta de seguridad registrada</li>
<li>✓ Código de verificación enviado a email registrado</li>
<li>✓ Llamada de confirmación al número alterno</li>
</ul>

<h3>Señales de alerta (Red Flags):</h3>
<ul>
<li>🚩 Cliente nervioso o apurado</li>
<li>🚩 Desconoce información básica de la cuenta</li>
<li>🚩 DNI con apariencia alterada</li>
<li>🚩 Múltiples intentos de validación fallidos</li>
<li>🚩 Solicitud desde ubicación inusual</li>
<li>🚩 Cambio reciente de datos de contacto</li>
</ul>

<h3>Proceso de investigación:</h3>
<ol>
<li>Seguridad revisa logs de acceso y cambios</li>
<li>Análisis de patrones en sistema antifraude</li>
<li>Entrevista a personal involucrado si aplica</li>
<li>Reporte a Indecopi/Fiscalía si corresponde</li>
<li>Reembolso al cliente afectado según política</li>
</ol>

<h3>Contactos de emergencia:</h3>
<ul>
<li>Seguridad Corporativa: interno 5555 (24/7)</li>
<li>Jefe de Fraude: interno 5560 (L-V 8-18)</li>
<li>Legal: interno 5570 (L-V 9-18)</li>
</ul>

<h3>Política de reembolso:</h3>
<p>Si se confirma fraude, el cliente recibe:</p>
<ul>
<li>Reembolso del 100% de consumos fraudulentos</li>
<li>Nueva SIM sin costo</li>
<li>Monitoreo especial por 6 meses</li>
<li>Carta de disculpas formal</li>
</ul>',
'Protocolo inicial de fraude - CONFIDENCIAL', 5, TRUE, 'PUBLICADO', 'MANUAL', NOW());


-- ============================================================================
-- FEEDBACK DE EJEMPLO
-- ============================================================================
INSERT INTO feedback_articulos (id_version, id_empleado, comentario, calificacion, util, creado_en) VALUES
(3, 3, 'Muy útil para configurar equipos nuevos', 5, TRUE, NOW()),
(3, 4, NULL, 4, TRUE, NOW()),
(5, 1, 'Información clara sobre tarifas', 5, TRUE, NOW()),
(5, 3, 'Falta información sobre paquetes específicos por país', 3, FALSE, NOW()),
(7, 2, 'Excelente guía de troubleshooting', 5, TRUE, NOW()),
(7, 3, 'Me ayudó a resolver el problema rápidamente', 5, TRUE, NOW()),
(8, 1, 'Proceso muy claro', 4, TRUE, NOW()),
(10, 4, 'FAQ muy completo', 5, TRUE, NOW()),
(11, 1, 'Información actualizada de planes', 4, TRUE, NOW()),
(14, 3, 'Mapa de cobertura muy útil', 5, TRUE, NOW()),
(14, 4, 'Necesita actualización de Callao', 3, TRUE, NOW());
