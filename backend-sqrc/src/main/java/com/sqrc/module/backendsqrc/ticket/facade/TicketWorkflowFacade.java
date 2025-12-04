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

    // --- 1. LOS "TRABAJADORES" (Servicios y Repositorios) ---
    private final TicketRepository ticketRepository;       // Para validar estado
    private final AsignacionService asignacionService;     // Para mover al empleado
    private final DocumentacionService documentacionService; // Para guardar la justificación
    private final DerivacionService derivacionService;     // Para registrar salida externa

    // --- 2. EL "ALTAVOZ" (Eventos) ---
    private final ApplicationEventPublisher eventPublisher;

    // =========================================================================
    // CASO 1: ESCALAR (Agente -> Backoffice)
    // =========================================================================
    @Transactional
    public void escalarTicket(Long ticketId, EscalarRequestDTO request) {

        // A. Validar que el ticket exista y sea escalable
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado: " + ticketId));

        if (ticket.getEstado() != EstadoTicket.ABIERTO) {
            throw new RuntimeException("No se puede escalar un ticket que no está ABIERTO. Estado actual: " + ticket.getEstado());
        }

        // B. Ejecutar la logística interna (Strategy está encapsulado aquí dentro)
        asignacionService.reasignarTicket(ticket, "BACKOFFICE");

        // C. Guardar la evidencia (Documentación)
        documentacionService.registrarEscalamiento(ticket, request.getProblematica(), request.getJustificacion());

        // D. Actualizar estado del ticket
        ticket.setEstado(EstadoTicket.ESCALADO);
        ticketRepository.save(ticket);

        // E. Gritar al mundo (Evento) - El Listener enviará el correo simulado
        eventPublisher.publishEvent(new TicketEscaladoEvent(this, ticket.getIdTicket()));
    }

    // =========================================================================
    // CASO 2: DERIVAR (Backoffice -> Área Externa / TI)
    // =========================================================================
    @Transactional
    public void derivarTicket(Long ticketId, DerivarRequestDTO request) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado: " + ticketId));

        // A. Registrar la salida legal (BD)
        derivacionService.registrarSalida(ticket, request);

        // B. Cambiar estado a DERIVADO (El ticket entra en espera)
        ticket.setEstado(EstadoTicket.DERIVADO);
        ticketRepository.save(ticket);

        // C. Gritar al mundo (Evento) - El Listener simulará el envío al correo externo
        // Nota: Obtenemos el correo del DTO (o podríamos buscarlo por ID de área si implementaste esa mejora)
        // Aquí asumimos que el DTO o el Service resolvió el email destino.
        String emailDestino = "area." + request.getAreaDestinoId() + "@externo.com"; // Simulación rápida si no viene en DTO

        eventPublisher.publishEvent(new TicketDerivadoEvent(this, ticket.getIdTicket(), emailDestino));
    }

    // =========================================================================
    // CASO 3: REGISTRAR RESPUESTA EXTERNA (TI responde -> Backoffice registra)
    // =========================================================================
    @Transactional
    public void registrarRespuestaExterna(Long ticketId, RespuestaDerivacionDTO respuesta) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado: " + ticketId));

        if (ticket.getEstado() != EstadoTicket.DERIVADO) {
            throw new RuntimeException("Solo se pueden registrar respuestas en tickets DERIVADOS.");
        }

        // A. Registrar la entrada (Log en BD)
        // (Podrías agregar un método en DerivacionService para esto si quieres guardar el historial de vuelta)
        // derivacionService.registrarEntrada(ticket, respuesta.getRespuestaExterna());

        // B. Decidir qué hacer con el ticket
        if (Boolean.TRUE.equals(respuesta.getSolucionado())) {
            // Si TI lo arregló, el ticket vuelve al flujo normal para cerrarse o informarse
            ticket.setEstado(EstadoTicket.ABIERTO); // O un estado "RESUELTO_POR_TI"
        } else {
            // Si TI lo rechazó o pidió más info
            ticket.setEstado(EstadoTicket.ABIERTO);
        }

        ticketRepository.save(ticket);

        // Opcional: Avisar al dueño actual que llegó respuesta
        // eventPublisher.publishEvent(new RespuestaExternaRecibidaEvent(...));
    }
}