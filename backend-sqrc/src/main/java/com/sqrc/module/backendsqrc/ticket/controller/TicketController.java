package com.sqrc.module.backendsqrc.ticket.controller;

import com.sqrc.module.backendsqrc.ticket.dto.TicketDetailDTO;
import com.sqrc.module.backendsqrc.ticket.dto.TicketFilterDTO;
import com.sqrc.module.backendsqrc.ticket.dto.TicketSummaryDTO;
import com.sqrc.module.backendsqrc.ticket.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestionar tickets en Vista 360
 */
@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
@Slf4j
public class TicketController {

    private final TicketService ticketService;

    /**
     * Busca tickets aplicando filtros
     *
     * @param filter Objeto con criterios de búsqueda
     * @return Lista de resúmenes de tickets
     */
    @PostMapping("/search")
    public ResponseEntity<List<TicketSummaryDTO>> searchTickets(@RequestBody TicketFilterDTO filter) {
        log.info("POST /api/v1/tickets/search - Buscando tickets con filtros");

        List<TicketSummaryDTO> results = ticketService.searchTickets(filter);

        return ResponseEntity.ok(results);
    }

    /**
     * Obtiene el detalle completo de un ticket
     *
     * @param id ID del ticket
     * @return Detalle completo del ticket
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketDetailDTO> getTicketById(@PathVariable Long id) {
        log.info("GET /api/v1/tickets/{} - Obteniendo detalle del ticket", id);

        TicketDetailDTO detail = ticketService.getTicketById(id);

        return ResponseEntity.ok(detail);
    }

    /**
     * Obtiene todos los tickets de un cliente
     *
     * @param clienteId ID del cliente
     * @return Lista de tickets del cliente
     */
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<TicketSummaryDTO>> getTicketsByCliente(@PathVariable Integer clienteId) {
        log.info("GET /api/v1/tickets/cliente/{} - Obteniendo tickets del cliente", clienteId);

        List<TicketSummaryDTO> tickets = ticketService.getTicketsByClienteId(clienteId);

        return ResponseEntity.ok(tickets);
    }

    /**
     * Health check del controlador
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("TicketController está operativo");
    }
}
