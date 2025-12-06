-- ============================================================================
-- SCRIPT SQL PARA CREAR LA BASE DE DATOS DE LOGS (logs_sqrc)
-- ============================================================================
-- Este script crea las tablas necesarias para el sistema de logging
-- Ejecutar en MySQL/MariaDB
-- ============================================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS logs_sqrc
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE logs_sqrc;

-- ============================================================================
-- TABLA: audit_logs
-- Almacena logs de auditoría generales de todas las operaciones del sistema
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    level VARCHAR(10) NOT NULL COMMENT 'Nivel: INFO, WARN, ERROR, DEBUG',
    category VARCHAR(50) NOT NULL COMMENT 'Categoría: CLIENTE, TICKET, ENCUESTA, ARTICULO, REPORTE, AUTH, ERROR',
    action VARCHAR(100) NOT NULL COMMENT 'Acción realizada',
    user_id BIGINT COMMENT 'ID del usuario que realizó la acción',
    user_name VARCHAR(100) COMMENT 'Nombre del usuario',
    user_type VARCHAR(30) COMMENT 'Tipo: AGENTE, BACKOFFICE, SUPERVISOR',
    entity_type VARCHAR(50) COMMENT 'Tipo de entidad afectada',
    entity_id VARCHAR(50) COMMENT 'ID de la entidad afectada',
    details JSON COMMENT 'Detalles adicionales en formato JSON',
    ip_address VARCHAR(45) COMMENT 'Dirección IP del cliente',
    user_agent VARCHAR(500) COMMENT 'User-Agent del navegador',
    request_uri VARCHAR(500) COMMENT 'URI de la petición',
    http_method VARCHAR(10) COMMENT 'Método HTTP: GET, POST, PUT, DELETE, PATCH',
    response_status INT COMMENT 'Código de respuesta HTTP',
    duration_ms BIGINT COMMENT 'Duración de la operación en milisegundos',
    
    INDEX idx_audit_timestamp (timestamp),
    INDEX idx_audit_category (category),
    INDEX idx_audit_user_id (user_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_level (level),
    INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Logs de auditoría general del sistema SQRC';

-- ============================================================================
-- TABLA: ticket_workflow_logs
-- Almacena logs específicos del flujo de trabajo de tickets
-- ============================================================================
CREATE TABLE IF NOT EXISTS ticket_workflow_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ticket_id BIGINT NOT NULL COMMENT 'ID del ticket afectado',
    action VARCHAR(50) NOT NULL COMMENT 'Acción: CREAR, ESCALAR, DERIVAR, CERRAR, RECHAZAR_ESCALAMIENTO',
    estado_anterior VARCHAR(30) COMMENT 'Estado antes de la acción',
    estado_nuevo VARCHAR(30) COMMENT 'Estado después de la acción',
    empleado_origen_id BIGINT COMMENT 'ID del empleado que realizó la acción',
    empleado_origen_nombre VARCHAR(100) COMMENT 'Nombre del empleado origen',
    empleado_destino_id BIGINT COMMENT 'ID del empleado destino (si aplica)',
    empleado_destino_nombre VARCHAR(100) COMMENT 'Nombre del empleado destino',
    area_destino_id BIGINT COMMENT 'ID del área destino (para derivaciones)',
    area_destino_nombre VARCHAR(100) COMMENT 'Nombre del área destino',
    motivo TEXT COMMENT 'Motivo o justificación de la acción',
    detalles JSON COMMENT 'Detalles adicionales en formato JSON',
    
    INDEX idx_workflow_ticket (ticket_id),
    INDEX idx_workflow_timestamp (timestamp),
    INDEX idx_workflow_action (action),
    INDEX idx_workflow_empleado_origen (empleado_origen_id),
    INDEX idx_workflow_empleado_destino (empleado_destino_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Logs del flujo de trabajo de tickets del sistema SQRC';

-- ============================================================================
-- TABLA: error_logs
-- Almacena logs de errores y excepciones con detalle completo
-- ============================================================================
CREATE TABLE IF NOT EXISTS error_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    exception_type VARCHAR(200) NOT NULL COMMENT 'Tipo de excepción (nombre completo de la clase)',
    message TEXT COMMENT 'Mensaje de error',
    stack_trace TEXT COMMENT 'Stack trace completo',
    request_uri VARCHAR(500) COMMENT 'URI de la petición que causó el error',
    http_method VARCHAR(10) COMMENT 'Método HTTP',
    user_id BIGINT COMMENT 'ID del usuario (si estaba autenticado)',
    user_name VARCHAR(100) COMMENT 'Nombre del usuario',
    request_body TEXT COMMENT 'Cuerpo de la petición (para debugging)',
    correlation_id VARCHAR(50) COMMENT 'ID de correlación para rastreo distribuido',
    ip_address VARCHAR(45) COMMENT 'Dirección IP del cliente',
    
    INDEX idx_error_timestamp (timestamp),
    INDEX idx_error_exception (exception_type),
    INDEX idx_error_correlation (correlation_id),
    INDEX idx_error_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Logs de errores y excepciones del sistema SQRC';

-- ============================================================================
-- TABLA: integration_logs
-- Almacena logs de integración con servicios externos
-- ============================================================================
CREATE TABLE IF NOT EXISTS integration_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    service_name VARCHAR(100) NOT NULL COMMENT 'Nombre del servicio: mod-ventas, gemini-api, smtp',
    operation VARCHAR(100) NOT NULL COMMENT 'Operación realizada',
    request_url VARCHAR(500) COMMENT 'URL de la petición externa',
    request_method VARCHAR(10) COMMENT 'Método HTTP',
    response_status INT COMMENT 'Código de respuesta HTTP',
    duration_ms BIGINT COMMENT 'Duración de la llamada en milisegundos',
    success BOOLEAN COMMENT 'Indica si la llamada fue exitosa',
    error_message TEXT COMMENT 'Mensaje de error (si falló)',
    correlation_id VARCHAR(50) COMMENT 'ID de correlación',
    request_payload TEXT COMMENT 'Payload de la petición (para debugging)',
    response_payload TEXT COMMENT 'Payload de la respuesta (para debugging)',
    
    INDEX idx_integration_timestamp (timestamp),
    INDEX idx_integration_service (service_name),
    INDEX idx_integration_success (success),
    INDEX idx_integration_correlation (correlation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Logs de integración con servicios externos del sistema SQRC';

-- ============================================================================
-- VISTAS ÚTILES PARA CONSULTAS
-- ============================================================================

-- Vista: Resumen de logs por categoría en las últimas 24 horas
CREATE OR REPLACE VIEW v_audit_summary_24h AS
SELECT 
    category,
    level,
    COUNT(*) as total,
    MIN(timestamp) as primera_ocurrencia,
    MAX(timestamp) as ultima_ocurrencia
FROM audit_logs
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY category, level
ORDER BY total DESC;

-- Vista: Resumen de workflow de tickets en las últimas 24 horas
CREATE OR REPLACE VIEW v_workflow_summary_24h AS
SELECT 
    action,
    COUNT(*) as total,
    COUNT(DISTINCT ticket_id) as tickets_unicos
FROM ticket_workflow_logs
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY action
ORDER BY total DESC;

-- Vista: Errores más frecuentes en las últimas 24 horas
CREATE OR REPLACE VIEW v_errors_summary_24h AS
SELECT 
    exception_type,
    COUNT(*) as total,
    MAX(timestamp) as ultimo_error
FROM error_logs
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY exception_type
ORDER BY total DESC;

-- Vista: Estado de integraciones en las últimas 24 horas
CREATE OR REPLACE VIEW v_integration_summary_24h AS
SELECT 
    service_name,
    COUNT(*) as total_llamadas,
    SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as exitosas,
    SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as fallidas,
    ROUND(AVG(duration_ms), 2) as promedio_duracion_ms,
    ROUND(100.0 * SUM(CASE WHEN success = true THEN 1 ELSE 0 END) / COUNT(*), 2) as tasa_exito_pct
FROM integration_logs
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY service_name
ORDER BY total_llamadas DESC;

-- ============================================================================
-- USUARIO Y PERMISOS (ejecutar como administrador)
-- ============================================================================
-- NOTA: Descomentar y ajustar según sea necesario

-- CREATE USER IF NOT EXISTS 'logs_sqrc'@'%' IDENTIFIED BY '123456';
-- GRANT ALL PRIVILEGES ON logs_sqrc.* TO 'logs_sqrc'@'%';
-- FLUSH PRIVILEGES;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

SELECT 'Base de datos logs_sqrc creada exitosamente!' AS resultado;
SELECT 'Tablas creadas: audit_logs, ticket_workflow_logs, error_logs, integration_logs' AS tablas;
SELECT 'Vistas creadas: v_audit_summary_24h, v_workflow_summary_24h, v_errors_summary_24h, v_integration_summary_24h' AS vistas;
