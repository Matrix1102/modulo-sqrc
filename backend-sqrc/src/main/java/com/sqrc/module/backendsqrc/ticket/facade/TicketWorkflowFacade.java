package com.sqrc.module.backendsqrc.ticket.facade;

import com.sqrc.module.backendsqrc.ticket.dto.DerivarRequestDTO;
import com.sqrc.module.backendsqrc.ticket.dto.EscalarRequestDTO;
import com.sqrc.module.backendsqrc.ticket.dto.RespuestaDerivacionDTO;
import com.sqrc.module.backendsqrc.ticket.event.TicketDerivadoEvent;
import com.sqrc.module.backendsqrc.ticket.event.TicketEscaladoEvent;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import com.sqrc.module.backendsqrc.ticket.repository.AsignacionRepository;
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
    private final AsignacionService asignacionService;
    private final DocumentacionService documentacionService;
    private final DerivacionService derivacionService;
    private final ApplicationEventPublisher eventPublisher;

    // Servicio para gestión de correos (incluye persistencia en BD)
    private final TicketEmailService ticketEmailService;

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

        // F. Notificar evento
        eventPublisher.publishEvent(new TicketEscaladoEvent(this, ticket.getIdTicket()));
    }

    // =========================================================================
    // CASO 2: DERIVAR (Backoffice -> Área Externa / TI)
    // =========================================================================
    @Transactional
    public void derivarTicket(Long ticketId, DerivarRequestDTO request) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado: " + ticketId));

        // A. Registrar salida
        derivacionService.registrarSalida(ticket, request);

        // B. Cambiar estado a DERIVADO (Aquí sí cambia porque sale de la empresa)
        ticket.setEstado(EstadoTicket.DERIVADO);
        ticketRepository.save(ticket);

        // C. Notificar
        String emailDestino = "area." + request.getAreaDestinoId() + "@externo.com";
        eventPublisher.publishEvent(new TicketDerivadoEvent(this, ticket.getIdTicket(), emailDestino));
    }

    // =========================================================================
    // CASO 3: REGISTRAR RESPUESTA EXTERNA
    // =========================================================================
    @Transactional
    public void registrarRespuestaExterna(Long ticketId, RespuestaDerivacionDTO respuesta) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado: " + ticketId));

        if (ticket.getEstado() != EstadoTicket.DERIVADO) {
            throw new RuntimeException("Solo se pueden registrar respuestas en tickets DERIVADOS.");
        }

        // Al volver, el ticket regresa a estado ABIERTO para que el Backoffice lo gestione
        ticket.setEstado(EstadoTicket.ABIERTO);
        ticketRepository.save(ticket);
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
}