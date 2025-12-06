package com.sqrc.module.backendsqrc.ticket.facade;

import com.sqrc.module.backendsqrc.logs.service.AuditLogService;
import com.sqrc.module.backendsqrc.ticket.dto.DerivarRequestDTO;
import com.sqrc.module.backendsqrc.ticket.dto.EscalarRequestDTO;
import com.sqrc.module.backendsqrc.ticket.dto.RechazarEscalamientoDTO;
import com.sqrc.module.backendsqrc.ticket.dto.RespuestaDerivacionDTO;
import com.sqrc.module.backendsqrc.ticket.enums.AreaExterna;
import com.sqrc.module.backendsqrc.ticket.event.TicketDerivadoEvent;
import com.sqrc.module.backendsqrc.ticket.event.TicketEscaladoEvent;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import com.sqrc.module.backendsqrc.ticket.repository.AsignacionRepository;
import com.sqrc.module.backendsqrc.ticket.repository.NotificacionExternaRepository;
import com.sqrc.module.backendsqrc.ticket.service.AsignacionService;
import com.sqrc.module.backendsqrc.ticket.service.DerivacionService;
import com.sqrc.module.backendsqrc.ticket.service.DocumentacionService;
import com.sqrc.module.backendsqrc.ticket.service.TicketEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketWorkflowFacade {

    private final TicketRepository ticketRepository;
    private final AsignacionRepository asignacionRepository;
    private final NotificacionExternaRepository notificacionExternaRepository;
    private final AsignacionService asignacionService;
    private final DocumentacionService documentacionService;
    private final DerivacionService derivacionService;
    private final ApplicationEventPublisher eventPublisher;

    // Servicio para gestión de correos (incluye persistencia en BD)
    private final TicketEmailService ticketEmailService;

    // Servicio de logs de auditoría
    private final AuditLogService auditLogService;

    // =========================================================================
    // CASO 1: ESCALAR (Agente -> Backoffice)
    // =========================================================================
    @Transactional
    public void escalarTicket(Long ticketId, EscalarRequestDTO request) {

        // A. Validar
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado: " + ticketId));

        if (ticket.getEstado() != EstadoTicket.ABIERTO) {
            throw new RuntimeException("No se puede escalar un ticket que no está ABIERTO.");
        }

        String estadoAnterior = ticket.getEstado().name();

        // B. Logística interna (Ahora retorna la asignación creada)
        Asignacion nuevaAsignacion = asignacionService.reasignarTicket(ticket, "BACKOFFICE");

        // C. Documentación
        documentacionService.registrarEscalamiento(ticket, request.getProblematica(), request.getJustificacion());

        // D. Actualizar Estado a ESCALADO
        ticket.setEstado(EstadoTicket.ESCALADO);
        ticketRepository.save(ticket);

        // E. Enviar y guardar correo de escalamiento
        log.info("🔄 Iniciando envío de correo para ticket {}", ticketId);
        try {
            enviarYGuardarCorreoEscalamiento(ticket, request, nuevaAsignacion);
            log.info("✅ Correo de escalamiento enviado y guardado para ticket {}", ticketId);
        } catch (Exception ex) {
            log.error("❌ Error al enviar/guardar correo de escalamiento para ticket {}: {}", ticketId, ex.getMessage(), ex);
            // No bloqueamos el escalamiento si falla el envío del correo
        }

        // F. Registrar en logs de auditoría
        Empleado agenteOrigen = nuevaAsignacion.getAsignacionPadre() != null 
                ? nuevaAsignacion.getAsignacionPadre().getEmpleado() : null;
        auditLogService.logTicketEscalamiento(
                ticketId,
                agenteOrigen != null ? agenteOrigen.getIdEmpleado() : null,
                agenteOrigen != null ? agenteOrigen.getNombreCompleto() : "Desconocido",
                nuevaAsignacion.getEmpleado().getIdEmpleado(),
                nuevaAsignacion.getEmpleado().getNombreCompleto(),
                estadoAnterior,
                request.getProblematica(),
                request.getJustificacion()
        );

        // G. Notificar evento
        eventPublisher.publishEvent(new TicketEscaladoEvent(this, ticket.getIdTicket()));
    }

    // =========================================================================
    // CASO 2: DERIVAR (Backoffice -> Área Externa / TI)
    // =========================================================================
    @Transactional
    public void derivarTicket(Long ticketId, DerivarRequestDTO request) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado: " + ticketId));

        String estadoAnterior = ticket.getEstado().name();

        // Obtener el BackOffice actual
        Asignacion asignacionActual = asignacionRepository.findAsignacionActiva(ticketId).orElse(null);

        // A. Registrar salida
        derivacionService.registrarSalida(ticket, request);

        // B. Cambiar estado a DERIVADO (Aquí sí cambia porque sale de la empresa)
        ticket.setEstado(EstadoTicket.DERIVADO);
        ticketRepository.save(ticket);

        // C. Registrar en logs de auditoría
        auditLogService.logTicketDerivacion(
                ticketId,
                asignacionActual != null ? asignacionActual.getEmpleado().getIdEmpleado() : null,
                asignacionActual != null ? asignacionActual.getEmpleado().getNombreCompleto() : "Desconocido",
                request.getAreaDestinoId(),
                AreaExterna.getNombreById(request.getAreaDestinoId()),
                estadoAnterior,
                request.getCuerpo() // Usamos cuerpo como motivo de derivación
        );

        // D. Notificar
        String emailDestino = "area." + request.getAreaDestinoId() + "@externo.com";
        eventPublisher.publishEvent(new TicketDerivadoEvent(this, ticket.getIdTicket(), emailDestino));
    }

    // =========================================================================
    // CASO 3: REGISTRAR RESPUESTA EXTERNA
    // =========================================================================
    @Transactional
    public void registrarRespuestaExterna(Long ticketId, RespuestaDerivacionDTO respuesta) {
        log.info("📥 Registrando respuesta externa para ticket #{}", ticketId);
        
        // 1. Validar ticket
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado: " + ticketId));

        if (ticket.getEstado() != EstadoTicket.DERIVADO) {
            throw new RuntimeException("Solo se pueden registrar respuestas en tickets DERIVADOS.");
        }

        // 2. Buscar la notificación externa pendiente (sin respuesta)
        NotificacionExterna notificacion = notificacionExternaRepository
                .findByTicket_IdTicket(ticketId)
                .stream()
                .filter(n -> n.getRespuesta() == null || n.getRespuesta().trim().isEmpty())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No se encontró derivación pendiente de respuesta"));

        // 3. Actualizar la notificación con la respuesta
        notificacion.setRespuesta(respuesta.getRespuestaExterna());
        notificacion.setFechaRespuesta(LocalDateTime.now());
        notificacionExternaRepository.save(notificacion);
        log.info("✅ Respuesta registrada en notificación externa ID: {}", notificacion.getIdNotificacion());

        // 4. Crear documentación para historial interno (opcional)
        try {
            Asignacion asignacionActiva = asignacionRepository.findAsignacionActiva(ticketId)
                    .orElseThrow(() -> new RuntimeException("No hay asignación activa"));
            
            Long backofficeId = asignacionActiva.getEmpleado().getIdEmpleado();
            documentacionService.registrarRespuestaExterna(ticket, respuesta.getRespuestaExterna(), backofficeId);
            log.info("📝 Documentación creada para ticket #{}", ticketId);
        } catch (Exception ex) {
            log.warn("⚠️ No se pudo crear documentación: {}", ex.getMessage());
        }

        // 5. Cambiar estado del ticket según si está solucionado
        String estadoNuevo;
        if (Boolean.TRUE.equals(respuesta.getSolucionado())) {
            ticket.setEstado(EstadoTicket.CERRADO);
            ticket.setFechaCierre(LocalDateTime.now());
            estadoNuevo = "CERRADO";
            log.info("🔒 Ticket #{} marcado como CERRADO (solucionado por área externa)", ticketId);
        } else {
            ticket.setEstado(EstadoTicket.ABIERTO);
            estadoNuevo = "ABIERTO";
            log.info("🔓 Ticket #{} regresa a ABIERTO para seguimiento del BackOffice", ticketId);
        }

        ticketRepository.save(ticket);

        // 6. Registrar en logs de auditoría
        auditLogService.logTicketRespuestaExterna(
                ticketId,
                "Área Externa",
                Boolean.TRUE.equals(respuesta.getSolucionado()),
                estadoNuevo
        );
    }

    // =========================================================================
    // CASO 4: RECHAZAR ESCALAMIENTO (BackOffice devuelve al Agente)
    // =========================================================================
    @Transactional
    public void rechazarEscalamiento(Long ticketId, RechazarEscalamientoDTO request) {
        log.info("↩️ Rechazando escalamiento para ticket #{}", ticketId);
        
        // 1. Validar ticket está ESCALADO
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado: " + ticketId));

        if (ticket.getEstado() != EstadoTicket.ESCALADO) {
            throw new RuntimeException("Solo se puede rechazar un ticket que está ESCALADO.");
        }

        // 2. Obtener asignación activa (BackOffice)
        Asignacion asignacionBackoffice = asignacionRepository.findAsignacionActiva(ticketId)
                .orElseThrow(() -> new RuntimeException("No hay asignación activa del BackOffice"));
        
        // 3. Obtener el Agente original (si existe asignación padre)
        Empleado agenteOriginal = null;
        String correoDestinatario = null;

        if (asignacionBackoffice.getAsignacionPadre() != null) {
            agenteOriginal = asignacionBackoffice.getAsignacionPadre().getEmpleado();
            correoDestinatario = agenteOriginal.getCorreo();
            log.info("📤 Se devolverá al Agente original: {}", agenteOriginal.getNombreCompleto());
        } else {
            // Si no hay asignación padre, enviar al correo del BackOffice como fallback
            correoDestinatario = asignacionBackoffice.getEmpleado().getCorreo();
            log.warn("⚠️ No se encontró asignación padre, el correo se enviará al BackOffice actual");
        }

        // 4. Registrar documentación del rechazo
        try {
            String documentacionTexto = String.format(
                "ESCALAMIENTO RECHAZADO POR BACKOFFICE\n\n" +
                "Motivo del Rechazo:\n%s\n\n" +
                "Instrucciones para Continuar:\n%s\n\n" +
                "Rechazado por: %s",
                request.getMotivoRechazo(),
                request.getInstrucciones(),
                asignacionBackoffice.getEmpleado().getNombreCompleto()
            );

            documentacionService.registrarRespuestaExterna(
                ticket,
                documentacionTexto,
                asignacionBackoffice.getEmpleado().getIdEmpleado()
            );

            log.info("📝 Documentación de rechazo creada para ticket #{}", ticketId);
        } catch (Exception ex) {
            log.error("❌ Error al crear documentación de rechazo: {}", ex.getMessage());
            // Continuar con el flujo aunque falle la documentación
        }

        // 5. Construir cuerpo del correo con feedback estructurado (texto plano)
        String cuerpoCompleto = "⚠️ MOTIVO DEL RECHAZO:\n" +
                request.getMotivoRechazo() + "\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "📋 INSTRUCCIONES PARA CONTINUAR:\n" +
                request.getInstrucciones() + "\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "🎯 ACCIÓN REQUERIDA:\n" +
                "El BackOffice ha revisado el caso y solicita que continúes con las instrucciones proporcionadas antes de volver a escalar.\n\n" +
                "• Revisa cuidadosamente las instrucciones proporcionadas\n" +
                "• Implementa las acciones recomendadas\n" +
                "• Si el problema persiste después de seguir estas instrucciones, puedes volver a escalar el ticket con información adicional\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "Rechazado por: " + asignacionBackoffice.getEmpleado().getNombreCompleto();

        // 6. Enviar y guardar correo de respuesta interna
        ticketEmailService.enviarYGuardarCorreo(
                correoDestinatario,
                request.getAsunto(),
                cuerpoCompleto,
                asignacionBackoffice,
                TipoCorreo.RESPUESTA_INTERNA
        );
        
        log.info("📧 Correo de rechazo enviado a: {} para ticket #{}", correoDestinatario, ticketId);

        // 7. Cerrar la asignación actual del BackOffice
        asignacionBackoffice.setFechaFin(LocalDateTime.now());
        asignacionRepository.save(asignacionBackoffice);
        log.info("🔒 Asignación del BackOffice cerrada (ID: {})", asignacionBackoffice.getIdAsignacion());

        // 8. Reasignar al Agente original si existe
        if (agenteOriginal != null) {
            Asignacion nuevaAsignacion = Asignacion.builder()
                    .ticket(ticket)
                    .empleado(agenteOriginal)
                    .asignacionPadre(asignacionBackoffice)
                    .fechaInicio(LocalDateTime.now())
                    .build();

            asignacionRepository.save(nuevaAsignacion);
            log.info("🔄 Ticket reasignado al Agente: {} (ID: {})",
                    agenteOriginal.getNombreCompleto(),
                    agenteOriginal.getIdEmpleado());
        } else {
            log.warn("⚠️ No se pudo reasignar al Agente original. El ticket queda sin asignación activa.");
        }

        // 9. Cambiar estado del ticket a ABIERTO
        ticket.setEstado(EstadoTicket.ABIERTO);
        ticketRepository.save(ticket);

        // 10. Registrar en logs de auditoría
        auditLogService.logTicketRechazoEscalamiento(
                ticketId,
                asignacionBackoffice.getEmpleado().getIdEmpleado(),
                asignacionBackoffice.getEmpleado().getNombreCompleto(),
                agenteOriginal != null ? agenteOriginal.getIdEmpleado() : null,
                agenteOriginal != null ? agenteOriginal.getNombreCompleto() : "Desconocido",
                request.getMotivoRechazo(),
                request.getInstrucciones()
        );
        
        log.info("✅ Ticket #{} devuelto al Agente con estado ABIERTO", ticketId);
    }

    // =========================================================================
    // MÉTODO AUXILIAR: ENVIAR Y GUARDAR CORREO
    // =========================================================================

    /**
     * Envía un correo de notificación de escalamiento y lo registra en la BD.
     *
     * Este método orquesta:
     * 1. Validación del BackOffice asignado
     * 2. Construcción del correo HTML usando los datos del frontend
     * 3. Envío usando TicketEmailService (MOCK)
     * 4. Registro en la tabla correo
     *
     * @param ticket Ticket que se está escalando
     * @param request Datos del escalamiento del frontend (asunto, problematica, justificacion)
     * @param asignacionActiva La asignación recién creada al BackOffice
     */
    private void enviarYGuardarCorreoEscalamiento(Ticket ticket, EscalarRequestDTO request, Asignacion asignacionActiva) {
        log.info("📧 [CORREO] Iniciando envío de correo para ticket #{}", ticket.getIdTicket());
        log.info("📧 [CORREO] Asignación ID: {}, Empleado: {}", 
                asignacionActiva.getIdAsignacion(), 
                asignacionActiva.getEmpleado().getNombreCompleto());
        
        // Obtener el empleado de la asignación
        Empleado backoffice = asignacionActiva.getEmpleado();
        if (!(backoffice instanceof BackOffice)) {
            log.warn("La asignación no es a un BackOffice, saltando envío de correo");
            return;
        }

        // Obtener información del empleado anterior (si existe asignación padre)
        Empleado empleadoAnterior = null;
        if (asignacionActiva.getAsignacionPadre() != null) {
            empleadoAnterior = asignacionActiva.getAsignacionPadre().getEmpleado();
        }

        // Formatear fecha
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String fechaEscalamiento = LocalDateTime.now().format(formatter);

        // Usar el asunto del request (del frontend)
        String asunto = request.getAsunto() != null && !request.getAsunto().isBlank()
            ? request.getAsunto()
            : String.format("Ticket #%d escalado", ticket.getIdTicket());

        // Construir cuerpo HTML usando los datos del frontend
        String cuerpo = String.format("""
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .header { background-color: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; }
                        .content { padding: 20px; }
                        .info-box { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
                        .label { font-weight: bold; color: #007bff; }
                        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 0.9em; color: #6c757d; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>⚠️ Notificación de Escalamiento de Ticket</h2>
                    </div>
                    
                    <div class="content">
                        <p>Estimado/a <strong>%s</strong>,</p>
                        
                        <p>Se le ha escalado el siguiente ticket para su atención prioritaria:</p>
                        
                        <div class="info-box">
                            <h3>📋 Información del Ticket</h3>
                            <p><span class="label">ID:</span> #%d</p>
                            <p><span class="label">Asunto Original:</span> %s</p>
                            <p><span class="label">Tipo:</span> %s</p>
                            <p><span class="label">Cliente:</span> %s</p>
                        </div>
                        
                        <div class="info-box">
                            <h3>👤 Información del Escalamiento</h3>
                            <p><span class="label">Escalado desde:</span> %s</p>
                            <p><span class="label">Fecha de escalamiento:</span> %s</p>
                        </div>
                        
                        <div class="info-box">
                            <h3>📝 Problemática Reportada</h3>
                            <p>%s</p>
                        </div>
                        
                        <div class="info-box">
                            <h3>✅ Justificación del Escalamiento</h3>
                            <p>%s</p>
                        </div>
                        
                        <p>Por favor, revise y atienda el ticket a la brevedad posible.</p>
                    </div>
                    
                    <div class="footer">
                        <p><em>Este es un correo automático del Sistema de Gestión de Tickets SQRC</em></p>
                        <p>Por favor no responda a este correo.</p>
                    </div>
                </body>
                </html>
                """,
                backoffice.getNombreCompleto(),
                ticket.getIdTicket(),
                ticket.getAsunto(),
                ticket.getTipoTicket(),
                ticket.getCliente() != null ?
                        ticket.getCliente().getNombres() + " " + ticket.getCliente().getApellidos() : "N/A",
                empleadoAnterior != null ? empleadoAnterior.getNombreCompleto() : "Desconocido",
                fechaEscalamiento,
                request.getProblematica() != null && !request.getProblematica().isBlank()
                    ? request.getProblematica()
                    : "No especificada",
                request.getJustificacion() != null && !request.getJustificacion().isBlank()
                    ? request.getJustificacion()
                    : "No especificada"
        );

        // Enviar correo usando TicketEmailService (MOCK) y guardar en BD
        ticketEmailService.enviarYGuardarCorreo(
                backoffice.getCorreo(),
                asunto,
                cuerpo,
                asignacionActiva,
                TipoCorreo.SOLICITUD_ESCALAMIENTO
        );

        log.info("✅ Correo de escalamiento procesado para ticket #{}", ticket.getIdTicket());
    }

    /**
     * Envía un correo interno al BackOffice notificando la respuesta del área externa
     * y lo registra en la BD.
     *
     * @param ticket Ticket que recibió la respuesta
     * @param respuesta Datos de la respuesta externa
     * @param asignacionBackoffice Asignación actual del BackOffice
     */
    private void enviarYGuardarCorreoRespuestaExterna(Ticket ticket, RespuestaDerivacionDTO respuesta,
                                                       Asignacion asignacionBackoffice) {
        log.info("📧 [CORREO RESPUESTA] Iniciando envío de correo de respuesta externa para ticket #{}", ticket.getIdTicket());

        Empleado backoffice = asignacionBackoffice.getEmpleado();
        String correoBackoffice = backoffice.getCorreo();

        String asunto = String.format("📥 Respuesta recibida de Área Externa - Ticket #%d", ticket.getIdTicket());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String fechaRespuesta = LocalDateTime.now().format(formatter);

        String estadoSolucion = Boolean.TRUE.equals(respuesta.getSolucionado())
            ? "✅ <span style='color: green; font-weight: bold;'>SOLUCIONADO</span>"
            : "⚠️ <span style='color: orange; font-weight: bold;'>REQUIERE SEGUIMIENTO</span>";

        String cuerpo = String.format("""
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .header { background-color: #e8f5e9; padding: 20px; border-left: 4px solid #4caf50; }
                        .content { padding: 20px; }
                        .info-box { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
                        .label { font-weight: bold; color: #4caf50; }
                        .respuesta-box { background-color: #fff3cd; padding: 15px; border-left: 3px solid #ffc107; }
                        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 0.9em; color: #6c757d; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>📥 Respuesta de Área Externa Recibida</h2>
                    </div>
                    
                    <div class="content">
                        <p>Estimado/a <strong>%s</strong>,</p>
                        
                        <p>Se ha recibido respuesta del área externa para el siguiente ticket:</p>
                        
                        <div class="info-box">
                            <h3>📋 Información del Ticket</h3>
                            <p><span class="label">ID:</span> #%d</p>
                            <p><span class="label">Asunto:</span> %s</p>
                            <p><span class="label">Fecha de respuesta:</span> %s</p>
                        </div>
                        
                        <div class="respuesta-box">
                            <h3>💬 Respuesta del Área Externa</h3>
                            <p>%s</p>
                        </div>
                        
                        <div class="info-box">
                            <h3>📊 Estado de la Solución</h3>
                            <p>%s</p>
                        </div>
                        
                        <p><strong>Acción requerida:</strong></p>
                        <ul>
                            <li>Revise la respuesta proporcionada</li>
                            <li>%s</li>
                        </ul>
                    </div>
                    
                    <div class="footer">
                        <p><em>Este es un correo automático del Sistema de Gestión de Tickets SQRC</em></p>
                        <p>Por favor no responda a este correo.</p>
                    </div>
                </body>
                </html>
                """,
                backoffice.getNombreCompleto(),
                ticket.getIdTicket(),
                ticket.getAsunto(),
                fechaRespuesta,
                respuesta.getRespuestaExterna() != null && !respuesta.getRespuestaExterna().isBlank()
                    ? respuesta.getRespuestaExterna()
                    : "Sin contenido especificado",
                estadoSolucion,
                Boolean.TRUE.equals(respuesta.getSolucionado())
                    ? "Proceda a cerrar el ticket si considera que la respuesta es satisfactoria"
                    : "Evalúe si se requieren acciones adicionales o seguimiento con el cliente"
        );

        ticketEmailService.enviarYGuardarCorreo(
                correoBackoffice,
                asunto,
                cuerpo,
                asignacionBackoffice,
                TipoCorreo.RESPUESTA_INTERNA
        );

        log.info("✅ Correo de respuesta externa procesado para ticket #{}", ticket.getIdTicket());
    }
}