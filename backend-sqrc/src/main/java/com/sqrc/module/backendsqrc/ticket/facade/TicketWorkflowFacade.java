package com.sqrc.module.backendsqrc.ticket.facade;

import com.sqrc.module.backendsqrc.ticket.dto.DerivarRequestDTO;
import com.sqrc.module.backendsqrc.ticket.dto.EscalarRequestDTO;
import com.sqrc.module.backendsqrc.ticket.dto.RespuestaDerivacionDTO;
import com.sqrc.module.backendsqrc.ticket.event.TicketDerivadoEvent;
import com.sqrc.module.backendsqrc.ticket.event.TicketEscaladoEvent;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.model.EstadoTicket;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import com.sqrc.module.backendsqrc.ticket.service.AsignacionService;
import com.sqrc.module.backendsqrc.ticket.service.DerivacionService;
import com.sqrc.module.backendsqrc.ticket.service.DocumentacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TicketWorkflowFacade {

    private final TicketRepository ticketRepository;
    private final AsignacionService asignacionService;
    private final DocumentacionService documentacionService;
    private final DerivacionService derivacionService;
    private final ApplicationEventPublisher eventPublisher;

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

        // B. Logística interna (Ahora enlaza el padre correctamente)
        asignacionService.reasignarTicket(ticket, "BACKOFFICE");

        // C. Documentación
        documentacionService.registrarEscalamiento(ticket, request.getProblematica(), request.getJustificacion());

        // D. Actualizar Estado -> ¡CORREGIDO: NO CAMBIAMOS EL ESTADO!
        // El ticket sigue ABIERTO, pero ahora está en la bandeja del Backoffice.
        // ticket.setEstado(EstadoTicket.ESCALADO); // <-- ELIMINADO
        // ticketRepository.save(ticket);           // <-- ELIMINADO

        // E. Notificar
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
}