package com.sqrc.module.backendsqrc.ticket.controller;

import com.sqrc.module.backendsqrc.ticket.dto.LlamadaDto;
import com.sqrc.module.backendsqrc.ticket.dto.request.AsociarLlamadaRequest;
import com.sqrc.module.backendsqrc.ticket.dto.request.CreateLlamadaRequest;
import com.sqrc.module.backendsqrc.ticket.model.EstadoLlamada;
import com.sqrc.module.backendsqrc.ticket.service.LlamadaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de llamadas.
 * 
 * Endpoints disponibles:
 * - POST   /api/v1/llamadas              -> Crear llamada
 * - POST   /api/v1/llamadas/asociar      -> Asociar llamada a ticket
 * - PATCH  /api/v1/llamadas/{id}/finalizar -> Finalizar llamada
 * - PATCH  /api/v1/llamadas/{id}/estado  -> Cambiar estado
 * - GET    /api/v1/llamadas/{id}         -> Obtener llamada por ID
 * - GET    /api/v1/llamadas/ticket/{id}  -> Obtener llamada de un ticket
 * - GET    /api/v1/llamadas/empleado/{id} -> Obtener llamadas de un empleado
 * - GET    /api/v1/llamadas/disponibles/{empleadoId} -> Llamadas sin ticket asignado
 */
@RestController
@RequestMapping("/api/v1/llamadas")
@RequiredArgsConstructor
@Slf4j
public class LlamadaController {

    private final LlamadaService llamadaService;

    /**
     * Crea una nueva llamada.
     */
    @PostMapping
    public ResponseEntity<LlamadaDto> crearLlamada(@Valid @RequestBody CreateLlamadaRequest request) {
        log.info("POST /api/v1/llamadas - Creando llamada");
        
        LlamadaDto response = llamadaService.crearLlamada(request);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Asocia una llamada existente a un ticket.
     */
    @PostMapping("/asociar")
    public ResponseEntity<LlamadaDto> asociarLlamada(@Valid @RequestBody AsociarLlamadaRequest request) {
        log.info("POST /api/v1/llamadas/asociar - Asociando llamada {} a ticket {}", 
                request.getLlamadaId(), request.getTicketId());
        
        LlamadaDto response = llamadaService.asociarLlamadaATicket(request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Finaliza una llamada.
     */
    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<LlamadaDto> finalizarLlamada(
            @PathVariable Long id,
            @RequestParam Integer duracionSegundos) {
        log.info("PATCH /api/v1/llamadas/{}/finalizar - Duración: {} segundos", id, duracionSegundos);
        
        LlamadaDto response = llamadaService.finalizarLlamada(id, duracionSegundos);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Cambia el estado de una llamada.
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<LlamadaDto> cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoLlamada estado) {
        log.info("PATCH /api/v1/llamadas/{}/estado - Nuevo estado: {}", id, estado);
        
        LlamadaDto response = llamadaService.cambiarEstado(id, estado);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene una llamada por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LlamadaDto> obtenerLlamadaPorId(@PathVariable Long id) {
        log.info("GET /api/v1/llamadas/{}", id);
        
        LlamadaDto response = llamadaService.obtenerLlamadaPorId(id);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene la llamada asociada a un ticket.
     */
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<LlamadaDto> obtenerLlamadaPorTicket(@PathVariable Long ticketId) {
        log.info("GET /api/v1/llamadas/ticket/{}", ticketId);
        
        LlamadaDto response = llamadaService.obtenerLlamadaPorTicket(ticketId);
        
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene las llamadas de un empleado.
     */
    @GetMapping("/empleado/{empleadoId}")
    public ResponseEntity<List<LlamadaDto>> obtenerLlamadasPorEmpleado(@PathVariable Long empleadoId) {
        log.info("GET /api/v1/llamadas/empleado/{}", empleadoId);
        
        List<LlamadaDto> response = llamadaService.obtenerLlamadasPorEmpleado(empleadoId);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene las llamadas sin ticket asignado de un empleado.
     */
    @GetMapping("/disponibles/{empleadoId}")
    public ResponseEntity<List<LlamadaDto>> obtenerLlamadasDisponibles(@PathVariable Long empleadoId) {
        log.info("GET /api/v1/llamadas/disponibles/{}", empleadoId);
        
        List<LlamadaDto> response = llamadaService.obtenerLlamadasDisponibles(empleadoId);
        
        return ResponseEntity.ok(response);
    }
}
