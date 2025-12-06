package com.sqrc.module.backendsqrc.logs.service;

import com.sqrc.module.backendsqrc.logs.model.*;
import com.sqrc.module.backendsqrc.logs.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Servicio principal para gestionar el registro de logs en la base de datos.
 * Proporciona métodos para registrar diferentes tipos de eventos de auditoría.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final TicketWorkflowLogRepository ticketWorkflowLogRepository;
    private final ErrorLogRepository errorLogRepository;
    private final IntegrationLogRepository integrationLogRepository;

    // ==================== LOGS DE AUDITORÍA GENERAL ====================

    /**
     * Registra un log de auditoría general.
     */
    @Async
    @Transactional("logsTransactionManager")
    public void logAudit(LogLevel level, LogCategory category, String action,
                         Long userId, String userName, String userType,
                         String entityType, String entityId,
                         Map<String, Object> details) {
        try {
            HttpServletRequest request = getCurrentRequest();

            AuditLog auditLog = AuditLog.builder()
                    .timestamp(LocalDateTime.now())
                    .level(level)
                    .category(category)
                    .action(action)
                    .userId(userId)
                    .userName(userName)
                    .userType(userType)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(request != null ? getClientIp(request) : null)
                    .userAgent(request != null ? request.getHeader("User-Agent") : null)
                    .requestUri(request != null ? request.getRequestURI() : null)
                    .httpMethod(request != null ? request.getMethod() : null)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log guardado: {} - {} - {}", category, action, entityId);
        } catch (Exception e) {
            log.error("Error al guardar audit log: {}", e.getMessage());
        }
    }

    /**
     * Versión simplificada para logs sin usuario específico.
     */
    @Async
    @Transactional("logsTransactionManager")
    public void logAudit(LogLevel level, LogCategory category, String action,
                         String entityType, String entityId, Map<String, Object> details) {
        logAudit(level, category, action, null, null, null, entityType, entityId, details);
    }

    /**
     * Versión que recibe información HTTP pre-capturada (para uso desde Aspects donde @Async pierde el contexto).
     */
    @Async
    @Transactional("logsTransactionManager")
    public void logAuditWithHttpInfo(LogLevel level, LogCategory category, String action,
                         String entityType, String entityId, Map<String, Object> details,
                         String ipAddress, String userAgent, String requestUri, String httpMethod) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .timestamp(LocalDateTime.now())
                    .level(level)
                    .category(category)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .requestUri(requestUri)
                    .httpMethod(httpMethod)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log con HTTP info guardado: {} - {} - {}", category, action, entityId);
        } catch (Exception e) {
            log.error("Error al guardar audit log con HTTP info: {}", e.getMessage());
        }
    }

    /**
     * Registra un log de auditoría con métricas (status, duration).
     */
    @Async
    @Transactional("logsTransactionManager")
    public void logAuditWithMetrics(LogLevel level, LogCategory category, String action,
                         Long userId, String userName, String userType,
                         String entityType, String entityId,
                         Map<String, Object> details, Integer responseStatus, Long durationMs) {
        try {
            HttpServletRequest request = getCurrentRequest();

            AuditLog auditLog = AuditLog.builder()
                    .timestamp(LocalDateTime.now())
                    .level(level)
                    .category(category)
                    .action(action)
                    .userId(userId)
                    .userName(userName)
                    .userType(userType)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(request != null ? getClientIp(request) : null)
                    .userAgent(request != null ? request.getHeader("User-Agent") : null)
                    .requestUri(request != null ? request.getRequestURI() : null)
                    .httpMethod(request != null ? request.getMethod() : null)
                    .responseStatus(responseStatus)
                    .durationMs(durationMs)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log con métricas guardado: {} - {} - {}", category, action, entityId);
        } catch (Exception e) {
            log.error("Error al guardar audit log con métricas: {}", e.getMessage());
        }
    }

    // ==================== LOGS DE CLIENTES (VISTA 360) ====================

    /**
     * Registra consulta de cliente.
     */
    public void logClienteConsulta(Long empleadoId, String empleadoNombre, Integer clienteId) {
        Map<String, Object> details = new HashMap<>();
        details.put("clienteId", clienteId);
        details.put("operacion", "CONSULTA");

        logAudit(LogLevel.INFO, LogCategory.CLIENTE, "CONSULTAR_CLIENTE",
                empleadoId, empleadoNombre, null, "Cliente", String.valueOf(clienteId), details);
    }

    /**
     * Registra búsqueda de cliente por DNI.
     */
    public void logClienteBusquedaDni(Long empleadoId, String empleadoNombre, String dni) {
        Map<String, Object> details = new HashMap<>();
        details.put("dni", enmascarar(dni));
        details.put("operacion", "BUSQUEDA_DNI");

        logAudit(LogLevel.INFO, LogCategory.CLIENTE, "BUSCAR_CLIENTE_DNI",
                empleadoId, empleadoNombre, null, "Cliente", dni, details);
    }

    /**
     * Registra actualización de información del cliente.
     */
    public void logClienteActualizacion(Long empleadoId, String empleadoNombre,
                                        Integer clienteId, Map<String, Object> camposActualizados) {
        Map<String, Object> details = new HashMap<>();
        details.put("clienteId", clienteId);
        details.put("camposActualizados", camposActualizados);
        details.put("operacion", "ACTUALIZACION");

        logAudit(LogLevel.INFO, LogCategory.CLIENTE, "ACTUALIZAR_CLIENTE",
                empleadoId, empleadoNombre, null, "Cliente", String.valueOf(clienteId), details);
    }

    /**
     * Registra consulta de métricas KPI.
     */
    public void logMetricasConsulta(Long empleadoId, String empleadoNombre, Integer clienteId) {
        Map<String, Object> details = new HashMap<>();
        details.put("clienteId", clienteId);
        details.put("operacion", "CONSULTA_METRICAS");

        logAudit(LogLevel.INFO, LogCategory.CLIENTE, "CONSULTAR_METRICAS_KPI",
                empleadoId, empleadoNombre, null, "MetricasKPI", String.valueOf(clienteId), details);
    }

    // ==================== LOGS DE TICKETS ====================

    /**
     * Registra creación de ticket.
     */
    public void logTicketCreacion(Long empleadoId, String empleadoNombre, String empleadoTipo,
                                   Long ticketId, String tipoTicket, String origen, Integer clienteId) {
        Map<String, Object> details = new HashMap<>();
        details.put("tipoTicket", tipoTicket);
        details.put("origen", origen);
        details.put("clienteId", clienteId);
        details.put("operacion", "CREACION");

        logAudit(LogLevel.INFO, LogCategory.TICKET, "CREAR_TICKET",
                empleadoId, empleadoNombre, empleadoTipo, "Ticket", String.valueOf(ticketId), details);
    }

    /**
     * Registra consulta de ticket.
     */
    public void logTicketConsulta(Long empleadoId, String empleadoNombre, Long ticketId) {
        Map<String, Object> details = new HashMap<>();
        details.put("ticketId", ticketId);
        details.put("operacion", "CONSULTA");

        logAudit(LogLevel.INFO, LogCategory.TICKET, "CONSULTAR_TICKET",
                empleadoId, empleadoNombre, null, "Ticket", String.valueOf(ticketId), details);
    }

    /**
     * Registra cambio de estado de ticket.
     */
    public void logTicketCambioEstado(Long empleadoId, String empleadoNombre,
                                       Long ticketId, String estadoAnterior, String estadoNuevo) {
        Map<String, Object> details = new HashMap<>();
        details.put("estadoAnterior", estadoAnterior);
        details.put("estadoNuevo", estadoNuevo);
        details.put("operacion", "CAMBIO_ESTADO");

        logAudit(LogLevel.WARN, LogCategory.TICKET, "CAMBIAR_ESTADO_TICKET",
                empleadoId, empleadoNombre, null, "Ticket", String.valueOf(ticketId), details);
    }

    // ==================== LOGS DE WORKFLOW DE TICKETS ====================

    /**
     * Registra escalamiento de ticket.
     */
    @Async
    @Transactional("logsTransactionManager")
    public void logTicketEscalamiento(Long ticketId, Long agenteId, String agenteNombre,
                                       Long backofficeId, String backofficeNombre,
                                       String estadoAnterior, String problematica, String justificacion) {
        try {
            Map<String, Object> detalles = new HashMap<>();
            detalles.put("problematica", problematica);
            detalles.put("justificacion", justificacion);

            TicketWorkflowLog workflowLog = TicketWorkflowLog.builder()
                    .timestamp(LocalDateTime.now())
                    .ticketId(ticketId)
                    .action("ESCALAR")
                    .estadoAnterior(estadoAnterior)
                    .estadoNuevo("ESCALADO")
                    .empleadoOrigenId(agenteId)
                    .empleadoOrigenNombre(agenteNombre)
                    .empleadoDestinoId(backofficeId)
                    .empleadoDestinoNombre(backofficeNombre)
                    .motivo(problematica)
                    .detalles(detalles)
                    .build();

            ticketWorkflowLogRepository.save(workflowLog);
            log.debug("Workflow log ESCALAR guardado para ticket {}", ticketId);
        } catch (Exception e) {
            log.error("Error al guardar workflow log de escalamiento: {}", e.getMessage());
        }
    }

    /**
     * Registra derivación de ticket.
     */
    @Async
    @Transactional("logsTransactionManager")
    public void logTicketDerivacion(Long ticketId, Long backofficeId, String backofficeNombre,
                                     Long areaDestinoId, String areaDestinoNombre,
                                     String estadoAnterior, String motivo) {
        try {
            Map<String, Object> detalles = new HashMap<>();
            detalles.put("motivoDerivacion", motivo);

            TicketWorkflowLog workflowLog = TicketWorkflowLog.builder()
                    .timestamp(LocalDateTime.now())
                    .ticketId(ticketId)
                    .action("DERIVAR")
                    .estadoAnterior(estadoAnterior)
                    .estadoNuevo("DERIVADO")
                    .empleadoOrigenId(backofficeId)
                    .empleadoOrigenNombre(backofficeNombre)
                    .areaDestinoId(areaDestinoId)
                    .areaDestinoNombre(areaDestinoNombre)
                    .motivo(motivo)
                    .detalles(detalles)
                    .build();

            ticketWorkflowLogRepository.save(workflowLog);
            log.debug("Workflow log DERIVAR guardado para ticket {}", ticketId);
        } catch (Exception e) {
            log.error("Error al guardar workflow log de derivación: {}", e.getMessage());
        }
    }

    /**
     * Registra cierre de ticket.
     */
    @Async
    @Transactional("logsTransactionManager")
    public void logTicketCierre(Long ticketId, Long empleadoId, String empleadoNombre,
                                 String estadoAnterior, Long tiempoResolucionMinutos) {
        try {
            Map<String, Object> detalles = new HashMap<>();
            detalles.put("tiempoResolucionMinutos", tiempoResolucionMinutos);

            TicketWorkflowLog workflowLog = TicketWorkflowLog.builder()
                    .timestamp(LocalDateTime.now())
                    .ticketId(ticketId)
                    .action("CERRAR")
                    .estadoAnterior(estadoAnterior)
                    .estadoNuevo("CERRADO")
                    .empleadoOrigenId(empleadoId)
                    .empleadoOrigenNombre(empleadoNombre)
                    .detalles(detalles)
                    .build();

            ticketWorkflowLogRepository.save(workflowLog);
            log.debug("Workflow log CERRAR guardado para ticket {}", ticketId);
        } catch (Exception e) {
            log.error("Error al guardar workflow log de cierre: {}", e.getMessage());
        }
    }

    /**
     * Registra rechazo de escalamiento.
     */
    @Async
    @Transactional("logsTransactionManager")
    public void logTicketRechazoEscalamiento(Long ticketId, Long backofficeId, String backofficeNombre,
                                              Long agenteId, String agenteNombre,
                                              String motivo, String instrucciones) {
        try {
            Map<String, Object> detalles = new HashMap<>();
            detalles.put("motivoRechazo", motivo);
            detalles.put("instrucciones", instrucciones);

            TicketWorkflowLog workflowLog = TicketWorkflowLog.builder()
                    .timestamp(LocalDateTime.now())
                    .ticketId(ticketId)
                    .action("RECHAZAR_ESCALAMIENTO")
                    .estadoAnterior("ESCALADO")
                    .estadoNuevo("ABIERTO")
                    .empleadoOrigenId(backofficeId)
                    .empleadoOrigenNombre(backofficeNombre)
                    .empleadoDestinoId(agenteId)
                    .empleadoDestinoNombre(agenteNombre)
                    .motivo(motivo)
                    .detalles(detalles)
                    .build();

            ticketWorkflowLogRepository.save(workflowLog);
            log.debug("Workflow log RECHAZAR_ESCALAMIENTO guardado para ticket {}", ticketId);
        } catch (Exception e) {
            log.error("Error al guardar workflow log de rechazo: {}", e.getMessage());
        }
    }

    /**
     * Registra respuesta externa.
     */
    @Async
    @Transactional("logsTransactionManager")
    public void logTicketRespuestaExterna(Long ticketId, String areaExterna, 
                                           boolean solucionado, String estadoNuevo) {
        try {
            Map<String, Object> detalles = new HashMap<>();
            detalles.put("areaExterna", areaExterna);
            detalles.put("solucionado", solucionado);

            TicketWorkflowLog workflowLog = TicketWorkflowLog.builder()
                    .timestamp(LocalDateTime.now())
                    .ticketId(ticketId)
                    .action("RESPUESTA_EXTERNA")
                    .estadoAnterior("DERIVADO")
                    .estadoNuevo(estadoNuevo)
                    .areaDestinoNombre(areaExterna)
                    .detalles(detalles)
                    .build();

            ticketWorkflowLogRepository.save(workflowLog);
            log.debug("Workflow log RESPUESTA_EXTERNA guardado para ticket {}", ticketId);
        } catch (Exception e) {
            log.error("Error al guardar workflow log de respuesta externa: {}", e.getMessage());
        }
    }

    // ==================== LOGS DE ENCUESTAS ====================

    /**
     * Registra creación de plantilla de encuesta.
     */
    public void logEncuestaPlantillaCreacion(Long supervisorId, String supervisorNombre,
                                              Long plantillaId, String nombrePlantilla) {
        Map<String, Object> details = new HashMap<>();
        details.put("plantillaId", plantillaId);
        details.put("nombrePlantilla", nombrePlantilla);

        logAudit(LogLevel.INFO, LogCategory.ENCUESTA, "CREAR_PLANTILLA",
                supervisorId, supervisorNombre, "SUPERVISOR", "PlantillaEncuesta", 
                String.valueOf(plantillaId), details);
    }

    /**
     * Registra respuesta de encuesta.
     */
    public void logEncuestaRespuesta(Long encuestaId, Integer clienteId, Integer calificacion) {
        Map<String, Object> details = new HashMap<>();
        details.put("encuestaId", encuestaId);
        details.put("clienteId", clienteId);
        details.put("calificacion", calificacion);

        logAudit(LogLevel.INFO, LogCategory.ENCUESTA, "RESPONDER_ENCUESTA",
                null, null, "CLIENTE", "Encuesta", String.valueOf(encuestaId), details);
    }

    /**
     * Registra envío de encuesta.
     */
    public void logEncuestaEnvio(Long encuestaId, String correoDestino, boolean exito) {
        Map<String, Object> details = new HashMap<>();
        details.put("correoDestino", enmascarar(correoDestino));
        details.put("exito", exito);

        LogLevel level = exito ? LogLevel.INFO : LogLevel.WARN;
        logAudit(level, LogCategory.ENCUESTA, "ENVIAR_ENCUESTA",
                null, null, null, "Encuesta", String.valueOf(encuestaId), details);
    }

    // ==================== LOGS DE ARTÍCULOS ====================

    /**
     * Registra creación de artículo.
     */
    public void logArticuloCreacion(Long autorId, String autorNombre,
                                     Integer articuloId, String titulo) {
        Map<String, Object> details = new HashMap<>();
        details.put("articuloId", articuloId);
        details.put("titulo", titulo);

        logAudit(LogLevel.INFO, LogCategory.ARTICULO, "CREAR_ARTICULO",
                autorId, autorNombre, null, "Articulo", String.valueOf(articuloId), details);
    }

    /**
     * Registra actualización de artículo.
     */
    public void logArticuloActualizacion(Long empleadoId, String empleadoNombre,
                                          Integer articuloId, Integer versionNueva) {
        Map<String, Object> details = new HashMap<>();
        details.put("articuloId", articuloId);
        details.put("versionNueva", versionNueva);

        logAudit(LogLevel.INFO, LogCategory.ARTICULO, "ACTUALIZAR_ARTICULO",
                empleadoId, empleadoNombre, null, "Articulo", String.valueOf(articuloId), details);
    }

    /**
     * Registra eliminación de artículo.
     */
    public void logArticuloEliminacion(Long empleadoId, String empleadoNombre, Integer articuloId) {
        Map<String, Object> details = new HashMap<>();
        details.put("articuloId", articuloId);

        logAudit(LogLevel.WARN, LogCategory.ARTICULO, "ELIMINAR_ARTICULO",
                empleadoId, empleadoNombre, null, "Articulo", String.valueOf(articuloId), details);
    }

    // ==================== LOGS DE REPORTES ====================

    /**
     * Registra consulta de dashboard.
     */
    public void logReporteDashboard(Long supervisorId, String supervisorNombre,
                                     String fechaInicio, String fechaFin) {
        Map<String, Object> details = new HashMap<>();
        details.put("fechaInicio", fechaInicio);
        details.put("fechaFin", fechaFin);

        logAudit(LogLevel.INFO, LogCategory.REPORTE, "CONSULTAR_DASHBOARD",
                supervisorId, supervisorNombre, "SUPERVISOR", "Dashboard", null, details);
    }

    // ==================== LOGS DE ERRORES ====================

    /**
     * Registra un error en la base de datos de logs.
     */
    @Async
    @Transactional("logsTransactionManager")
    public void logError(Exception exception, String requestUri, String httpMethod,
                         Long userId, String userName, String requestBody, String correlationId) {
        try {
            HttpServletRequest request = getCurrentRequest();

            ErrorLog errorLog = ErrorLog.builder()
                    .timestamp(LocalDateTime.now())
                    .exceptionType(exception.getClass().getName())
                    .message(exception.getMessage())
                    .stackTrace(getStackTrace(exception))
                    .requestUri(requestUri)
                    .httpMethod(httpMethod)
                    .userId(userId)
                    .userName(userName)
                    .requestBody(requestBody)
                    .correlationId(correlationId)
                    .ipAddress(request != null ? getClientIp(request) : null)
                    .build();

            errorLogRepository.save(errorLog);
            log.debug("Error log guardado: {} - {}", exception.getClass().getSimpleName(), requestUri);
        } catch (Exception e) {
            log.error("Error al guardar error log: {}", e.getMessage());
        }
    }

    /**
     * Versión simplificada para errores sin contexto de usuario.
     */
    public void logError(Exception exception, String requestUri, String httpMethod) {
        try {
            HttpServletRequest request = getCurrentRequest();
            String requestBody = request != null ? extractRequestBody(request) : null;
            logError(exception, requestUri, httpMethod, null, null, requestBody, generateCorrelationId());
        } catch (Exception e) {
            logError(exception, requestUri, httpMethod, null, null, null, null);
        }
    }

    /**
     * Extrae el body del request para debugging.
     */
    private String extractRequestBody(HttpServletRequest request) {
        try {
            // Solo para POST, PUT, PATCH
            String method = request.getMethod();
            if ("POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method)) {
                Object body = request.getAttribute("REQUEST_BODY");
                if (body != null) {
                    return body.toString();
                }
            }
        } catch (Exception e) {
            log.debug("No se pudo extraer request body: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Genera un ID de correlación único.
     */
    private String generateCorrelationId() {
        return java.util.UUID.randomUUID().toString();
    }

    // ==================== LOGS DE INTEGRACIÓN ====================

    /**
     * Registra llamada a servicio externo (versión básica).
     */
    @Async
    @Transactional("logsTransactionManager")
    public void logIntegration(String serviceName, String operation, String requestUrl,
                                String requestMethod, Integer responseStatus, Long durationMs,
                                boolean success, String errorMessage, String correlationId) {
        logIntegrationFull(serviceName, operation, requestUrl, requestMethod, responseStatus, 
                durationMs, success, errorMessage, correlationId, null, null);
    }

    /**
     * Registra llamada a servicio externo con payloads completos.
     */
    @Async
    @Transactional("logsTransactionManager")
    public void logIntegrationFull(String serviceName, String operation, String requestUrl,
                                String requestMethod, Integer responseStatus, Long durationMs,
                                boolean success, String errorMessage, String correlationId,
                                String requestPayload, String responsePayload) {
        try {
            // Generar correlationId si no se proporciona
            String corrId = correlationId != null ? correlationId : generateCorrelationId();

            IntegrationLog integrationLog = IntegrationLog.builder()
                    .timestamp(LocalDateTime.now())
                    .serviceName(serviceName)
                    .operation(operation)
                    .requestUrl(requestUrl)
                    .requestMethod(requestMethod)
                    .responseStatus(responseStatus)
                    .durationMs(durationMs)
                    .success(success)
                    .errorMessage(errorMessage)
                    .correlationId(corrId)
                    .requestPayload(requestPayload)
                    .responsePayload(responsePayload)
                    .build();

            integrationLogRepository.save(integrationLog);
            log.debug("Integration log guardado: {} - {} - {}", serviceName, operation, success);
        } catch (Exception e) {
            log.error("Error al guardar integration log: {}", e.getMessage());
        }
    }

    // ==================== MÉTODOS AUXILIARES ====================

    /**
     * Obtiene el request HTTP actual.
     */
    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attrs != null ? attrs.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Obtiene la IP del cliente, considerando proxies.
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Convierte un stack trace a String.
     */
    private String getStackTrace(Exception e) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        return sw.toString();
    }

    /**
     * Enmascara datos sensibles (DNI, correos).
     */
    private String enmascarar(String valor) {
        if (valor == null || valor.length() < 4) {
            return "****";
        }
        int visibles = Math.min(3, valor.length() / 3);
        return valor.substring(0, visibles) + "****" + valor.substring(valor.length() - visibles);
    }
}
