package com.sqrc.module.backendsqrc.logs.aspect;

import com.sqrc.module.backendsqrc.logs.annotation.Auditable;
import com.sqrc.module.backendsqrc.logs.model.LogCategory;
import com.sqrc.module.backendsqrc.logs.model.LogLevel;
import com.sqrc.module.backendsqrc.logs.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.Map;

/**
 * Aspecto AOP para auditar automáticamente las operaciones del sistema.
 * Intercepta métodos anotados con @Auditable y métodos de controladores específicos.
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogService auditLogService;

    // ==================== UTILIDADES HTTP ====================

    /**
     * Captura la información HTTP del request actual (debe llamarse en el hilo principal, antes de @Async).
     */
    private HttpInfo captureHttpInfo() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                return new HttpInfo(
                    getClientIp(request),
                    request.getHeader("User-Agent"),
                    request.getRequestURI(),
                    request.getMethod()
                );
            }
        } catch (Exception e) {
            log.debug("No se pudo capturar HTTP info: {}", e.getMessage());
        }
        return new HttpInfo(null, null, null, null);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record HttpInfo(String ipAddress, String userAgent, String requestUri, String httpMethod) {}

    // ==================== AUDITORÍA POR ANOTACIÓN ====================

    /**
     * Intercepta métodos anotados con @Auditable
     */
    @Around("@annotation(auditable)")
    public Object auditAnnotatedMethod(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;
        Exception exception = null;
        Integer responseStatus = null;

        try {
            result = joinPoint.proceed();
            responseStatus = 200; // Asumimos éxito si no hay excepción
            return result;
        } catch (Exception e) {
            exception = e;
            responseStatus = 500; // Error interno
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            logAuditableMethod(joinPoint, auditable, result, exception, duration, responseStatus);
        }
    }

    private void logAuditableMethod(ProceedingJoinPoint joinPoint, Auditable auditable,
                                     Object result, Exception exception, long duration, Integer responseStatus) {
        try {
            Map<String, Object> details = new HashMap<>();
            details.put("method", joinPoint.getSignature().getName());
            details.put("class", joinPoint.getTarget().getClass().getSimpleName());
            details.put("durationMs", duration);
            details.put("success", exception == null);

            if (exception != null) {
                details.put("error", exception.getMessage());
            }

            // Extraer ID de entidad de los argumentos si es posible
            String entityId = extractEntityId(joinPoint.getArgs());
            String entityType = auditable.entityType().isEmpty() ? null : auditable.entityType();

            LogLevel level = exception != null ? LogLevel.ERROR : auditable.level();

            auditLogService.logAuditWithMetrics(level, auditable.category(), auditable.action(),
                    null, null, null, entityType, entityId, details, responseStatus, duration);
        } catch (Exception e) {
            log.error("Error en aspecto de auditoría: {}", e.getMessage());
        }
    }

    // ==================== AUDITORÍA DE VISTA 360 ====================

    /**
     * Intercepta consultas de clientes en Vista360
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.vista360.controller.Vista360ClienteController.obtenerClientePorId(..))",
            returning = "result")
    public void afterObtenerCliente(JoinPoint joinPoint, Object result) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof Integer clienteId) {
                auditLogService.logClienteConsulta(null, null, clienteId);
            }
        } catch (Exception e) {
            log.error("Error al auditar consulta de cliente: {}", e.getMessage());
        }
    }

    /**
     * Intercepta búsquedas por DNI
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.vista360.controller.Vista360ClienteController.buscarClientePorDni(..))",
            returning = "result")
    public void afterBuscarClienteDni(JoinPoint joinPoint, Object result) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof String dni) {
                auditLogService.logClienteBusquedaDni(null, null, dni);
            }
        } catch (Exception e) {
            log.error("Error al auditar búsqueda por DNI: {}", e.getMessage());
        }
    }

    /**
     * Intercepta actualización de cliente
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.vista360.controller.Vista360ClienteController.actualizarInformacionCliente(..))",
            returning = "result")
    public void afterActualizarCliente(JoinPoint joinPoint, Object result) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof Integer clienteId) {
                Map<String, Object> detalles = new HashMap<>();
                detalles.put("resultado", "exitoso");
                auditLogService.logClienteActualizacion(null, null, clienteId, detalles);
            }
        } catch (Exception e) {
            log.error("Error al auditar actualización de cliente: {}", e.getMessage());
        }
    }

    /**
     * Intercepta consulta de métricas KPI
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.vista360.controller.Vista360ClienteController.obtenerMetricasCliente(..))",
            returning = "result")
    public void afterObtenerMetricas(JoinPoint joinPoint, Object result) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof Integer clienteId) {
                auditLogService.logMetricasConsulta(null, null, clienteId);
            }
        } catch (Exception e) {
            log.error("Error al auditar consulta de métricas: {}", e.getMessage());
        }
    }

    // ==================== AUDITORÍA DE TICKETS ====================

    /**
     * Intercepta creación de tickets
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.ticket.controller.TicketGestionController.crearTicket(..))",
            returning = "result")
    public void afterCrearTicket(JoinPoint joinPoint, Object result) {
        try {
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "CREAR_TICKET");
            details.put("resultado", "exitoso");

            auditLogService.logAudit(LogLevel.INFO, LogCategory.TICKET, "CREAR_TICKET",
                    "Ticket", null, details);
        } catch (Exception e) {
            log.error("Error al auditar creación de ticket: {}", e.getMessage());
        }
    }

    /**
     * Intercepta consulta de tickets
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.ticket.controller.TicketController.getTicketById(..))",
            returning = "result")
    public void afterObtenerTicket(JoinPoint joinPoint, Object result) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof Long ticketId) {
                auditLogService.logTicketConsulta(null, null, ticketId);
            }
        } catch (Exception e) {
            log.error("Error al auditar consulta de ticket: {}", e.getMessage());
        }
    }

    /**
     * Intercepta cambios de estado de tickets
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.ticket.controller.TicketGestionController.cambiarEstado(..))",
            returning = "result")
    public void afterCambiarEstado(JoinPoint joinPoint, Object result) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof Long ticketId) {
                Map<String, Object> details = new HashMap<>();
                details.put("operacion", "CAMBIAR_ESTADO");

                auditLogService.logAudit(LogLevel.WARN, LogCategory.TICKET, "CAMBIAR_ESTADO",
                        "Ticket", String.valueOf(ticketId), details);
            }
        } catch (Exception e) {
            log.error("Error al auditar cambio de estado: {}", e.getMessage());
        }
    }

    /**
     * Intercepta cierre de tickets
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.ticket.controller.TicketGestionController.cerrarTicket(..))",
            returning = "result")
    public void afterCerrarTicket(JoinPoint joinPoint, Object result) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof Long ticketId) {
                auditLogService.logTicketCierre(ticketId, null, null, "ABIERTO", null);
            }
        } catch (Exception e) {
            log.error("Error al auditar cierre de ticket: {}", e.getMessage());
        }
    }

    // ==================== AUDITORÍA DE ENCUESTAS ====================

    /**
     * Intercepta creación de plantillas de encuesta
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.encuesta.controller.EncuestaController.crearPlantilla(..))",
            returning = "result")
    public void afterCrearPlantilla(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "CREAR_PLANTILLA");
            
            // Extraer ID de la plantilla creada desde el resultado
            String plantillaId = null;
            if (result != null) {
                try {
                    var idMethod = result.getClass().getMethod("id");
                    Object id = idMethod.invoke(result);
                    if (id != null) {
                        plantillaId = id.toString();
                        details.put("plantillaId", plantillaId);
                    }
                } catch (Exception ignored) {}
            }

            auditLogService.logAuditWithHttpInfo(LogLevel.INFO, LogCategory.ENCUESTA, "CREAR_PLANTILLA",
                    "PlantillaEncuesta", plantillaId, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar creación de plantilla: {}", e.getMessage());
        }
    }

    /**
     * Intercepta respuestas de encuestas vía /respuestas
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.encuesta.controller.EncuestaController.guardarRespuestas(..))",
            returning = "result")
    public void afterGuardarRespuesta(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Object[] args = joinPoint.getArgs();
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "RESPONDER_ENCUESTA");
            
            // Extraer encuestaId del request si está disponible
            String encuestaId = null;
            if (args.length > 0 && args[0] != null) {
                try {
                    var encuestaIdMethod = args[0].getClass().getMethod("encuestaId");
                    Object id = encuestaIdMethod.invoke(args[0]);
                    if (id != null) {
                        encuestaId = id.toString();
                        details.put("encuestaId", encuestaId);
                    }
                } catch (Exception ignored) {}
            }

            auditLogService.logAuditWithHttpInfo(LogLevel.INFO, LogCategory.ENCUESTA, "RESPONDER_ENCUESTA",
                    "Encuesta", encuestaId, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar respuesta de encuesta: {}", e.getMessage());
        }
    }

    /**
     * Intercepta respuestas de encuestas vía endpoint /responder
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.encuesta.controller.EncuestaController.responderEncuesta(..))",
            returning = "result")
    public void afterResponderEncuesta(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Object[] args = joinPoint.getArgs();
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "RESPONDER_ENCUESTA");
            
            String encuestaId = null;
            if (args.length > 0 && args[0] != null) {
                try {
                    var encuestaIdMethod = args[0].getClass().getMethod("encuestaId");
                    Object id = encuestaIdMethod.invoke(args[0]);
                    if (id != null) {
                        encuestaId = id.toString();
                        details.put("encuestaId", encuestaId);
                    }
                } catch (Exception ignored) {}
            }

            auditLogService.logAuditWithHttpInfo(LogLevel.INFO, LogCategory.ENCUESTA, "RESPONDER_ENCUESTA",
                    "Encuesta", encuestaId, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar respuesta de encuesta: {}", e.getMessage());
        }
    }

    /**
     * Intercepta actualización de plantillas de encuesta
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.encuesta.controller.EncuestaController.actualizarPlantilla(..))",
            returning = "result")
    public void afterActualizarPlantilla(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Object[] args = joinPoint.getArgs();
            String plantillaId = args.length > 0 ? String.valueOf(args[0]) : null;
            
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "ACTUALIZAR_PLANTILLA");
            details.put("plantillaId", plantillaId);

            auditLogService.logAuditWithHttpInfo(LogLevel.INFO, LogCategory.ENCUESTA, "ACTUALIZAR_PLANTILLA",
                    "PlantillaEncuesta", plantillaId, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar actualización de plantilla: {}", e.getMessage());
        }
    }

    /**
     * Intercepta desactivación de plantillas de encuesta
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.encuesta.controller.EncuestaController.desactivarPlantilla(..))",
            returning = "result")
    public void afterDesactivarPlantilla(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Object[] args = joinPoint.getArgs();
            String plantillaId = args.length > 0 ? String.valueOf(args[0]) : null;
            
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "DESACTIVAR_PLANTILLA");
            details.put("plantillaId", plantillaId);

            auditLogService.logAuditWithHttpInfo(LogLevel.WARN, LogCategory.ENCUESTA, "DESACTIVAR_PLANTILLA",
                    "PlantillaEncuesta", plantillaId, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar desactivación de plantilla: {}", e.getMessage());
        }
    }

    /**
     * Intercepta reactivación de plantillas de encuesta
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.encuesta.controller.EncuestaController.reactivarPlantilla(..))",
            returning = "result")
    public void afterReactivarPlantilla(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Object[] args = joinPoint.getArgs();
            String plantillaId = args.length > 0 ? String.valueOf(args[0]) : null;
            
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "REACTIVAR_PLANTILLA");
            details.put("plantillaId", plantillaId);

            auditLogService.logAuditWithHttpInfo(LogLevel.INFO, LogCategory.ENCUESTA, "REACTIVAR_PLANTILLA",
                    "PlantillaEncuesta", plantillaId, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar reactivación de plantilla: {}", e.getMessage());
        }
    }

    /**
     * Intercepta reenvío de encuestas
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.encuesta.controller.EncuestaController.reenviarEncuesta*(..)) || " +
                       "execution(* com.sqrc.module.backendsqrc.encuesta.controller.EncuestaController.reenviarEncuestaByEncuestaId(..))",
            returning = "result")
    public void afterReenviarEncuesta(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Object[] args = joinPoint.getArgs();
            String encuestaId = args.length > 0 ? String.valueOf(args[0]) : null;
            
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "REENVIAR_ENCUESTA");
            details.put("encuestaId", encuestaId);

            auditLogService.logAuditWithHttpInfo(LogLevel.INFO, LogCategory.ENCUESTA, "REENVIAR_ENCUESTA",
                    "Encuesta", encuestaId, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar reenvío de encuesta: {}", e.getMessage());
        }
    }

    /**
     * Intercepta envío manual de encuestas
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.encuesta.controller.EncuestaController.enviarEncuestaManual(..))",
            returning = "result")
    public void afterEnviarEncuestaManual(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Object[] args = joinPoint.getArgs();
            String encuestaId = args.length > 0 ? String.valueOf(args[0]) : null;
            
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "ENVIAR_ENCUESTA_MANUAL");
            details.put("encuestaId", encuestaId);

            auditLogService.logAuditWithHttpInfo(LogLevel.INFO, LogCategory.COMUNICACION, "ENVIAR_ENCUESTA_MANUAL",
                    "Encuesta", encuestaId, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar envío manual de encuesta: {}", e.getMessage());
        }
    }

    // ==================== AUDITORÍA DE ARTÍCULOS ====================

    /**
     * Intercepta creación de artículos
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.baseDeConocimientos.controller.ArticuloController.crearArticulo(..))",
            returning = "result")
    public void afterCrearArticulo(JoinPoint joinPoint, Object result) {
        try {
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "CREAR_ARTICULO");

            auditLogService.logAudit(LogLevel.INFO, LogCategory.ARTICULO, "CREAR_ARTICULO",
                    "Articulo", null, details);
        } catch (Exception e) {
            log.error("Error al auditar creación de artículo: {}", e.getMessage());
        }
    }

    /**
     * Intercepta actualización de artículos
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.baseDeConocimientos.controller.ArticuloController.actualizarArticulo(..))",
            returning = "result")
    public void afterActualizarArticulo(JoinPoint joinPoint, Object result) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof Integer articuloId) {
                Map<String, Object> details = new HashMap<>();
                details.put("operacion", "ACTUALIZAR_ARTICULO");

                auditLogService.logAudit(LogLevel.INFO, LogCategory.ARTICULO, "ACTUALIZAR_ARTICULO",
                        "Articulo", String.valueOf(articuloId), details);
            }
        } catch (Exception e) {
            log.error("Error al auditar actualización de artículo: {}", e.getMessage());
        }
    }

    /**
     * Intercepta eliminación de artículos
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.baseDeConocimientos.controller.ArticuloController.eliminarArticulo(..))")
    public void afterEliminarArticulo(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof Integer articuloId) {
                auditLogService.logArticuloEliminacion(null, null, articuloId);
            }
        } catch (Exception e) {
            log.error("Error al auditar eliminación de artículo: {}", e.getMessage());
        }
    }

    // ==================== AUDITORÍA DE REPORTES/DASHBOARD ====================

    /**
     * Intercepta consultas al dashboard principal
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.reporte.controller.ReporteController.obtenerDashboardGeneral(..))",
            returning = "result")
    public void afterObtenerDashboard(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Object[] args = joinPoint.getArgs();
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "CONSULTAR_DASHBOARD");
            if (args.length >= 2) {
                details.put("startDate", args[0] != null ? args[0].toString() : null);
                details.put("endDate", args[1] != null ? args[1].toString() : null);
            }

            auditLogService.logAuditWithHttpInfo(LogLevel.INFO, LogCategory.REPORTE, "CONSULTAR_DASHBOARD",
                    "Dashboard", null, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar consulta de dashboard: {}", e.getMessage());
        }
    }

    /**
     * Intercepta consultas de métricas de agentes
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.reporte.controller.ReporteController.obtenerMetricasAgentes(..))",
            returning = "result")
    public void afterObtenerMetricasAgentes(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Object[] args = joinPoint.getArgs();
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "CONSULTAR_METRICAS_AGENTES");
            if (args.length >= 2) {
                details.put("startDate", args[0] != null ? args[0].toString() : null);
                details.put("endDate", args[1] != null ? args[1].toString() : null);
            }

            auditLogService.logAuditWithHttpInfo(LogLevel.INFO, LogCategory.REPORTE, "CONSULTAR_METRICAS_AGENTES",
                    "Reporte", null, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar consulta de métricas de agentes: {}", e.getMessage());
        }
    }

    /**
     * Intercepta consultas de métricas de encuestas
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.reporte.controller.ReporteController.obtenerMetricasEncuestas(..))",
            returning = "result")
    public void afterObtenerMetricasEncuestas(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Object[] args = joinPoint.getArgs();
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "CONSULTAR_METRICAS_ENCUESTAS");
            if (args.length >= 2) {
                details.put("startDate", args[0] != null ? args[0].toString() : null);
                details.put("endDate", args[1] != null ? args[1].toString() : null);
            }

            auditLogService.logAuditWithHttpInfo(LogLevel.INFO, LogCategory.REPORTE, "CONSULTAR_METRICAS_ENCUESTAS",
                    "Reporte", null, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar consulta de métricas de encuestas: {}", e.getMessage());
        }
    }

    /**
     * Intercepta consultas de tickets por agente
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.reporte.controller.ReporteTicketsController.obtenerTicketsPorAgente(..))",
            returning = "result")
    public void afterObtenerTicketsPorAgente(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Object[] args = joinPoint.getArgs();
            String agenteId = args.length > 0 ? String.valueOf(args[0]) : null;
            
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "CONSULTAR_TICKETS_AGENTE");
            details.put("agenteId", agenteId);
            if (args.length >= 3) {
                details.put("startDate", args[1] != null ? args[1].toString() : null);
                details.put("endDate", args[2] != null ? args[2].toString() : null);
            }

            auditLogService.logAuditWithHttpInfo(LogLevel.INFO, LogCategory.REPORTE, "CONSULTAR_TICKETS_AGENTE",
                    "Reporte", agenteId, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar consulta de tickets por agente: {}", e.getMessage());
        }
    }

    /**
     * Intercepta consultas de tickets recientes
     */
    @AfterReturning(
            pointcut = "execution(* com.sqrc.module.backendsqrc.reporte.controller.ReporteTicketsController.obtenerTicketsRecientes(..))",
            returning = "result")
    public void afterObtenerTicketsRecientes(JoinPoint joinPoint, Object result) {
        HttpInfo http = captureHttpInfo();
        try {
            Object[] args = joinPoint.getArgs();
            Map<String, Object> details = new HashMap<>();
            details.put("operacion", "CONSULTAR_TICKETS_RECIENTES");
            if (args.length >= 2) {
                details.put("startDate", args[0] != null ? args[0].toString() : null);
                details.put("endDate", args[1] != null ? args[1].toString() : null);
            }
            if (args.length >= 3 && args[2] != null) {
                details.put("limit", args[2].toString());
            }

            auditLogService.logAuditWithHttpInfo(LogLevel.INFO, LogCategory.REPORTE, "CONSULTAR_TICKETS_RECIENTES",
                    "Reporte", null, details,
                    http.ipAddress(), http.userAgent(), http.requestUri(), http.httpMethod());
        } catch (Exception e) {
            log.error("Error al auditar consulta de tickets recientes: {}", e.getMessage());
        }
    }

    // ==================== MÉTODOS AUXILIARES ====================

    /**
     * Extrae el ID de entidad de los argumentos del método
     */
    private String extractEntityId(Object[] args) {
        for (Object arg : args) {
            if (arg instanceof Long || arg instanceof Integer) {
                return String.valueOf(arg);
            }
        }
        return null;
    }
}
