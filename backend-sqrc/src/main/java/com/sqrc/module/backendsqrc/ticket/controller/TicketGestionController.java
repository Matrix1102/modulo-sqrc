package com.sqrc.module.backendsqrc.ticket.controller;

import com.sqrc.module.backendsqrc.ticket.dto.CorreoDTO;
import com.sqrc.module.backendsqrc.ticket.dto.DocumentacionDto;
import com.sqrc.module.backendsqrc.ticket.dto.request.*;
import com.sqrc.module.backendsqrc.ticket.dto.response.*;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import com.sqrc.module.backendsqrc.ticket.service.CorreoService;
import com.sqrc.module.backendsqrc.ticket.service.DocumentacionService;
import com.sqrc.module.backendsqrc.ticket.service.TicketGestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controlador REST para la gestión del ciclo de vida de tickets.
 * 
 * Patrón: REST Controller + MVC
 * 
 * Endpoints disponibles:
 * - GET    /api/tickets                           -> Listar tickets
 * - GET    /api/tickets/{id}                      -> Obtener ticket
 * - POST   /api/tickets                           -> Crear ticket
 * - PUT    /api/tickets/{id}                      -> Actualizar ticket
 * - PATCH  /api/tickets/{id}/estado               -> Cambiar estado
 * - POST   /api/tickets/{id}/escalar              -> Escalar ticket
 * - POST   /api/tickets/{id}/derivar              -> Derivar ticket
 * - POST   /api/tickets/{id}/devolver             -> Devolver ticket
 * - POST   /api/tickets/{id}/cerrar               -> Cerrar ticket
 * - GET    /api/tickets/{id}/documentacion        -> Listar documentación
 * - POST   /api/tickets/{id}/documentacion        -> Crear documentación
 * - GET    /api/tickets/{id}/correos              -> Obtener hilo de correos
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Slf4j
public class TicketGestionController {

    private final TicketGestionService ticketGestionService;
    private final DocumentacionService documentacionService;
    private final CorreoService correoService;
    private final TicketRepository ticketRepository;

    /**
     * Lista todos los tickets con filtros opcionales.
     * 
     * @param tipo Filtro por tipo de ticket (CONSULTA, QUEJA, RECLAMO, SOLICITUD)
     * @param estado Filtro por estado (ABIERTO, ESCALADO, DERIVADO, CERRADO)
     * @param fecha Filtro por fecha específica de creación (formato: yyyy-MM-dd)
     * @param search Búsqueda por texto en asunto o cliente
     * @return Lista de tickets en formato DTO ordenados por fecha descendente
     */
    @GetMapping
    public ResponseEntity<List<TicketListItemDTO>> listarTickets(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String search) {
        log.info("GET /api/tickets - Listando tickets con filtros: tipo={}, estado={}, fecha={}, search={}", 
                tipo, estado, fecha, search);
        
        List<TicketListItemDTO> tickets = ticketRepository.findAll().stream()
                .filter(ticket -> tipo == null || tipo.isEmpty() || ticket.getTipoTicket().name().equals(tipo))
                .filter(ticket -> estado == null || estado.isEmpty() || ticket.getEstado().name().equals(estado))
                .filter(ticket -> {
                    if (fecha == null || fecha.isEmpty()) return true;
                    String ticketFecha = ticket.getFechaCreacion().toLocalDate().toString();
                    return ticketFecha.equals(fecha);
                })
                .filter(ticket -> {
                    if (search == null || search.isEmpty()) return true;
                    String searchLower = search.toLowerCase();
                    boolean matchAsunto = ticket.getAsunto() != null && 
                            ticket.getAsunto().toLowerCase().contains(searchLower);
                    boolean matchCliente = ticket.getCliente() != null && (
                            (ticket.getCliente().getNombres() != null && 
                             ticket.getCliente().getNombres().toLowerCase().contains(searchLower)) ||
                            (ticket.getCliente().getApellidos() != null && 
                             ticket.getCliente().getApellidos().toLowerCase().contains(searchLower))
                    );
                    return matchAsunto || matchCliente;
                })
                .sorted((t1, t2) -> t2.getFechaCreacion().compareTo(t1.getFechaCreacion())) // Orden descendente
                .map(this::convertToListItemDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(tickets);
    }

    /**
     * Convierte una entidad Ticket a TicketListItemDTO
     */
    private TicketListItemDTO convertToListItemDTO(Ticket ticket) {
        TicketListItemDTO.ClienteInfoDTO clienteInfo = null;
        if (ticket.getCliente() != null) {
            clienteInfo = TicketListItemDTO.ClienteInfoDTO.builder()
                    .idCliente(ticket.getCliente().getIdCliente())
                    .nombre(ticket.getCliente().getNombres())
                    .apellido(ticket.getCliente().getApellidos())
                    .build();
        }
        
        return TicketListItemDTO.builder()
                .idTicket(ticket.getIdTicket())
                .asunto(ticket.getAsunto())
                .estado(ticket.getEstado())
                .tipoTicket(ticket.getTipoTicket())
                .origen(ticket.getOrigen())
                .fechaCreacion(ticket.getFechaCreacion())
                .cliente(clienteInfo)
                .build();
    }

    /**
     * Obtiene un ticket por ID con detalle completo.
     * 
     * @param id ID del ticket
     * @return Ticket encontrado con información completa del cliente
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketFullDetailDTO> obtenerTicket(@PathVariable Long id) {
        log.info("GET /api/tickets/{} - Obteniendo detalle completo del ticket", id);
        
        TicketFullDetailDTO ticketDetail = ticketGestionService.obtenerDetalleCompleto(id);
        
        return ResponseEntity.ok(ticketDetail);
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
     * Valida si un ticket puede ser cerrado.
     * Verifica que exista respuesta enviada y documentación.
     * 
     * @param id ID del ticket
     * @return CierreValidacionResponse con el estado de validación
     */
    @GetMapping("/{id}/puede-cerrar")
    public ResponseEntity<CierreValidacionResponse> validarCierre(@PathVariable Long id) {
        log.info("GET /api/tickets/{}/puede-cerrar - Validando requisitos de cierre", id);
        
        CierreValidacionResponse response = ticketGestionService.validarCierre(id);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Cierra un ticket.
     * Requisitos:
     * - El ticket no debe estar ya cerrado
     * - Debe existir respuesta enviada al cliente
     * - Debe existir documentación del caso
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

    // ==================== Documentación ====================

    /**
     * Obtiene la documentación de un ticket.
     * 
     * @param id ID del ticket
     * @return Lista de documentaciones
     */
    @GetMapping("/{id}/documentacion")
    public ResponseEntity<List<DocumentacionDto>> obtenerDocumentacion(@PathVariable Long id) {
        log.info("GET /api/tickets/{}/documentacion - Obteniendo documentación", id);
        
        List<DocumentacionDto> documentacion = documentacionService.obtenerDocumentacionPorTicket(id);
        
        return ResponseEntity.ok(documentacion);
    }

    /**
     * Crea documentación para un ticket.
     * 
     * @param id ID del ticket
     * @param request DTO con los datos de la documentación
     * @return DocumentacionCreatedResponse con el resultado
     */
    @PostMapping("/{id}/documentacion")
    public ResponseEntity<DocumentacionCreatedResponse> crearDocumentacion(
            @PathVariable Long id,
            @Valid @RequestBody CreateDocumentacionRequest request) {
        log.info("POST /api/tickets/{}/documentacion - Creando documentación", id);
        
        // Asegurar que el ticketId del request coincida con el path
        request.setTicketId(id);
        
        DocumentacionCreatedResponse response = documentacionService.crearDocumentacion(request);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ==================== Correos / Hilo ====================

    /**
     * Obtiene el hilo de correos (historial de comunicaciones) de un ticket.
     * Incluye todos los correos enviados durante escalamientos, derivaciones, etc.
     * 
     * @param id ID del ticket
     * @return Lista de correos ordenados por fecha (más recientes primero)
     */
    @GetMapping("/{id}/correos")
    public ResponseEntity<List<CorreoDTO>> obtenerCorreos(@PathVariable Long id) {
        log.info("GET /api/tickets/{}/correos - Obteniendo hilo de correos", id);
        
        List<CorreoDTO> correos = correoService.obtenerCorreosPorTicket(id);
        
        return ResponseEntity.ok(correos);
    }
}
