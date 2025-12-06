package com.sqrc.module.backendsqrc.ticket.controller;

import com.sqrc.module.backendsqrc.ticket.dto.NotificacionExternaDTO;
import com.sqrc.module.backendsqrc.ticket.dto.TicketDerivadoSimuladorDTO;
import com.sqrc.module.backendsqrc.ticket.model.EstadoTicket;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import com.sqrc.module.backendsqrc.ticket.service.NotificacionExternaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controlador REST para el simulador de área externa.
 *
 * Este controlador simula el sistema de un área externa (TI, Ventas, etc.)
 * que recibe tickets derivados y puede enviar respuestas.
 *
 * Endpoints:
 * - GET /api/simulador/tickets-derivados -> Lista tickets en estado DERIVADO
 */
@RestController
@RequestMapping("/api/simulador")
@RequiredArgsConstructor
@Slf4j
public class SimuladorController {

    private final TicketRepository ticketRepository;
    private final NotificacionExternaService notificacionExternaService;

    /**
     * Lista todos los tickets en estado DERIVADO con sus notificaciones.
     * Simula la bandeja de entrada de un área externa.
     *
     * @return Lista de tickets derivados con su información de derivación
     */
    @GetMapping("/tickets-derivados")
    public ResponseEntity<List<TicketDerivadoSimuladorDTO>> listarTicketsDerivados() {
        log.info("GET /api/simulador/tickets-derivados - Listando tickets derivados");

        // Obtener todos los tickets en estado DERIVADO
        List<Ticket> ticketsDerivados = ticketRepository.findByEstadoIn(List.of(EstadoTicket.DERIVADO));

        // Mapear a DTOs con sus notificaciones
        List<TicketDerivadoSimuladorDTO> resultado = ticketsDerivados.stream().map(ticket -> {
            // Obtener notificaciones del ticket
            List<NotificacionExternaDTO> notificaciones = notificacionExternaService.obtenerPorTicket(ticket.getIdTicket());

            // Tomar la más reciente (primera en la lista si están ordenadas por fecha desc)
            NotificacionExternaDTO ultimaNotificacion = notificaciones.isEmpty() ? null : notificaciones.get(0);

            return new TicketDerivadoSimuladorDTO(
                    ticket.getIdTicket(),
                    ticket.getAsunto(),
                    ticket.getDescripcion(),
                    ultimaNotificacion
            );
        }).collect(Collectors.toList());

        log.info("Se encontraron {} tickets derivados", resultado.size());

        return ResponseEntity.ok(resultado);
    }
}

