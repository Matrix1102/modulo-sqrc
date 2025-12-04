package com.sqrc.module.backendsqrc.ticket.controller;

import com.sqrc.module.backendsqrc.ticket.dto.DocumentacionDto;
import com.sqrc.module.backendsqrc.ticket.dto.request.CreateDocumentacionRequest;
import com.sqrc.module.backendsqrc.ticket.dto.request.UpdateDocumentacionRequest;
import com.sqrc.module.backendsqrc.ticket.dto.response.DocumentacionCreatedResponse;
import com.sqrc.module.backendsqrc.ticket.service.DocumentacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de documentación de tickets.
 * 
 * Patrón: REST Controller + MVC
 * 
 * Endpoints disponibles:
 * - POST   /api/v1/documentacion              -> Crear documentación
 * - PUT    /api/v1/documentacion/{id}         -> Actualizar documentación
 * - GET    /api/v1/documentacion/{id}         -> Obtener documentación por ID
 * - GET    /api/v1/documentacion/ticket/{id}  -> Obtener documentación de un ticket
 * - DELETE /api/v1/documentacion/{id}         -> Eliminar documentación
 */
@RestController
@RequestMapping("/api/v1/documentacion")
@RequiredArgsConstructor
@Slf4j
public class DocumentacionController {

    private final DocumentacionService documentacionService;

    /**
     * Crea una nueva documentación para un ticket.
     * 
     * @param request DTO con los datos de la documentación
     * @return DocumentacionCreatedResponse con el resultado
     */
    @PostMapping
    public ResponseEntity<DocumentacionCreatedResponse> crearDocumentacion(
            @Valid @RequestBody CreateDocumentacionRequest request) {
        log.info("POST /api/v1/documentacion - Creando documentación para ticket: {}", request.getTicketId());
        
        DocumentacionCreatedResponse response = documentacionService.crearDocumentacion(request);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Actualiza una documentación existente.
     * 
     * @param id ID de la documentación
     * @param request DTO con los campos a actualizar
     * @return DocumentacionCreatedResponse con el resultado
     */
    @PutMapping("/{id}")
    public ResponseEntity<DocumentacionCreatedResponse> actualizarDocumentacion(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDocumentacionRequest request) {
        log.info("PUT /api/v1/documentacion/{} - Actualizando documentación", id);
        
        DocumentacionCreatedResponse response = documentacionService.actualizarDocumentacion(id, request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene una documentación específica por ID.
     * 
     * @param id ID de la documentación
     * @return DocumentacionDto
     */
    @GetMapping("/{id}")
    public ResponseEntity<DocumentacionDto> obtenerDocumentacionPorId(@PathVariable Long id) {
        log.info("GET /api/v1/documentacion/{} - Obteniendo documentación", id);
        
        DocumentacionDto response = documentacionService.obtenerDocumentacionPorId(id);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene toda la documentación de un ticket.
     * 
     * @param ticketId ID del ticket
     * @return Lista de DocumentacionDto
     */
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<DocumentacionDto>> obtenerDocumentacionPorTicket(@PathVariable Long ticketId) {
        log.info("GET /api/v1/documentacion/ticket/{} - Obteniendo documentación del ticket", ticketId);
        
        List<DocumentacionDto> response = documentacionService.obtenerDocumentacionPorTicket(ticketId);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Elimina una documentación.
     * 
     * @param id ID de la documentación
     * @return ResponseEntity vacío con status 204
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarDocumentacion(@PathVariable Long id) {
        log.info("DELETE /api/v1/documentacion/{} - Eliminando documentación", id);
        
        documentacionService.eliminarDocumentacion(id);
        
        return ResponseEntity.noContent().build();
    }
}
