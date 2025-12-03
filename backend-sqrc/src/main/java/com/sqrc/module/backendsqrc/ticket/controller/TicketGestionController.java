package com.sqrc.module.backendsqrc.ticket.controller;

import com.sqrc.module.backendsqrc.ticket.dto.request.*;
import com.sqrc.module.backendsqrc.ticket.dto.response.*;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import com.sqrc.module.backendsqrc.ticket.service.TicketGestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión del ciclo de vida de tickets.
 * 
 * Patrón: REST Controller + MVC
 * 
 * Endpoints disponibles:
 * - GET    /api/tickets                 -> Listar tickets
 * - GET    /api/tickets/{id}            -> Obtener ticket
 * - POST   /api/tickets                 -> Crear ticket
 * - PUT    /api/tickets/{id}            -> Actualizar ticket
 * - PATCH  /api/tickets/{id}/estado     -> Cambiar estado
 * - POST   /api/tickets/{id}/escalar    -> Escalar ticket
 * - POST   /api/tickets/{id}/derivar    -> Derivar ticket
 * - POST   /api/tickets/{id}/devolver   -> Devolver ticket
 * - POST   /api/tickets/{id}/cerrar     -> Cerrar ticket
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Slf4j
public class TicketGestionController {

    private final TicketGestionService ticketGestionService;
    private final TicketRepository ticketRepository;

    /**
     * Lista todos los tickets.
     * 
     * @return Lista de tickets
     */
    @GetMapping
    public ResponseEntity<List<Ticket>> listarTickets() {
        log.info("GET /api/tickets - Listando todos los tickets");
        
        List<Ticket> tickets = ticketRepository.findAll();
        
        return ResponseEntity.ok(tickets);
    }

    /**
     * Obtiene un ticket por ID.
     * 
     * @param id ID del ticket
     * @return Ticket encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> obtenerTicket(@PathVariable Long id) {
        log.info("GET /api/tickets/{} - Obteniendo ticket", id);
        
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado con ID: " + id));
        
        return ResponseEntity.ok(ticket);
    }

    /**
     * Crea un nuevo ticket.
     * 
     * @param request DTO con los datos del ticket
     * @return TicketCreatedResponse con información del ticket creado
     */
    @PostMapping
    public ResponseEntity<TicketCreatedResponse> crearTicket(@Valid @RequestBody CreateTicketRequest request) {
        log.info("POST /api/tickets - Creando ticket de tipo: {}", request.getTipoTicket());
        
        TicketCreatedResponse response = ticketGestionService.crearTicket(request);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Actualiza un ticket existente.
     * 
     * @param id ID del ticket
     * @param request DTO con los campos a actualizar
     * @return TicketOperationResponse con el resultado
     */
    @PutMapping("/{id}")
    public ResponseEntity<TicketOperationResponse> actualizarTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequest request) {
        log.info("PUT /api/tickets/{} - Actualizando ticket", id);
        
        TicketOperationResponse response = ticketGestionService.actualizarTicket(id, request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Cambia el estado de un ticket.
     * 
     * @param id ID del ticket
     * @param request DTO con el nuevo estado
     * @return TicketOperationResponse con el resultado
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<TicketOperationResponse> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoRequest request) {
        log.info("PATCH /api/tickets/{}/estado - Cambiando a: {}", id, request.getNuevoEstado());
        
        TicketOperationResponse response = ticketGestionService.cambiarEstado(id, request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Escala un ticket del Agente al BackOffice.
     * 
     * @param id ID del ticket
     * @param request DTO con datos de escalamiento
     * @return TicketOperationResponse con el resultado
     */
    @PostMapping("/{id}/escalar")
    public ResponseEntity<TicketOperationResponse> escalarTicket(
            @PathVariable Long id,
            @Valid @RequestBody EscalarTicketRequest request) {
        log.info("POST /api/tickets/{}/escalar - Escalando al BackOffice", id);
        
        TicketOperationResponse response = ticketGestionService.escalarTicket(id, request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Deriva un ticket del BackOffice a un área especializada.
     * 
     * @param id ID del ticket
     * @param request DTO con datos de derivación
     * @return TicketOperationResponse con el resultado
     */
    @PostMapping("/{id}/derivar")
    public ResponseEntity<TicketOperationResponse> derivarTicket(
            @PathVariable Long id,
            @Valid @RequestBody DerivarTicketRequest request) {
        log.info("POST /api/tickets/{}/derivar - Derivando al área {}", id, request.getAreaId());
        
        TicketOperationResponse response = ticketGestionService.derivarTicket(id, request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Devuelve un ticket (rechaza escalamiento o derivación).
     * 
     * @param id ID del ticket
     * @param empleadoId ID del empleado que recibe el ticket
     * @param motivo Motivo de la devolución
     * @return TicketOperationResponse con el resultado
     */
    @PostMapping("/{id}/devolver")
    public ResponseEntity<TicketOperationResponse> devolverTicket(
            @PathVariable Long id,
            @RequestParam Long empleadoId,
            @RequestParam(required = false) String motivo) {
        log.info("POST /api/tickets/{}/devolver - Devolviendo al empleado {}", id, empleadoId);
        
        TicketOperationResponse response = ticketGestionService.devolverTicket(id, empleadoId, motivo);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Cierra un ticket.
     * 
     * @param id ID del ticket
     * @param empleadoId ID del empleado que cierra
     * @return TicketOperationResponse con el resultado
     */
    @PostMapping("/{id}/cerrar")
    public ResponseEntity<TicketOperationResponse> cerrarTicket(
            @PathVariable Long id,
            @RequestParam Long empleadoId) {
        log.info("POST /api/tickets/{}/cerrar - Cerrando por empleado {}", id, empleadoId);
        
        TicketOperationResponse response = ticketGestionService.cerrarTicket(id, empleadoId);
        
        return ResponseEntity.ok(response);
    }
}
