package com.sqrc.module.backendsqrc.encuesta.controller;

import com.sqrc.module.backendsqrc.encuesta.dto.*; // Importa PlantillaRequestDTO, EncuestaResultadoDTO, etc.
import com.sqrc.module.backendsqrc.encuesta.service.EncuestaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/encuestas") // URL limpia (sin /v1)
@RequiredArgsConstructor
public class EncuestaController {

    private final EncuestaService encuestaService;

    // ==========================================
    // 1. GESTIÓN DE PLANTILLAS (Templates)
    // ==========================================

    @GetMapping("/plantillas")
    public ResponseEntity<List<PlantillaResponseDTO>> listarPlantillas() {
        return ResponseEntity.ok(encuestaService.listarPlantillas());
    }

    @PostMapping("/plantillas")
    public ResponseEntity<PlantillaResponseDTO> crearPlantilla(@Valid @RequestBody PlantillaRequestDTO request) {
        PlantillaResponseDTO nueva = encuestaService.crearPlantilla(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @GetMapping("/plantillas/{id}")
    public ResponseEntity<PlantillaResponseDTO> obtenerPlantilla(@PathVariable String id) {
        return ResponseEntity.ok(encuestaService.obtenerPlantillaPorId(id));
    }

    @PutMapping("/plantillas/{id}")
    public ResponseEntity<PlantillaResponseDTO> actualizarPlantilla(
            @PathVariable String id,
            @Valid @RequestBody PlantillaRequestDTO request) {
        return ResponseEntity.ok(encuestaService.actualizarPlantilla(id, request));
    }

    // Endpoint para que el cliente envíe las respuestas de una encuesta
    @PostMapping("/respuestas")
    public ResponseEntity<Void> guardarRespuestas(@Valid @RequestBody com.sqrc.module.backendsqrc.encuesta.dto.RespuestaClienteDTO request) {
        encuestaService.guardarRespuesta(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // ==========================================
    // 2. GESTIÓN DE RESPUESTAS (LO NUEVO QUE PEDISTE)
    // ==========================================

    // Listar respuestas con filtros (para la grilla del Supervisor)
    @GetMapping("/respuestas")
    public ResponseEntity<List<EncuestaResultadoDTO>> listarRespuestas(
            @RequestParam(required = false) String alcanceEvaluacion, // "AGENTE" o "SERVICIO"
            @RequestParam(required = false) String agenteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer limit) {
        // Nota: Soportamos un parámetro opcional `limit` para pedir los N registros más recientes.
        return ResponseEntity.ok(encuestaService.listarRespuestas(alcanceEvaluacion, agenteId, startDate, endDate, limit));
    }

    // Ver el detalle de una respuesta específica
    @GetMapping("/respuestas/{responseId}")
    public ResponseEntity<EncuestaResultadoDTO> obtenerDetalleRespuesta(@PathVariable String responseId) {
        // Nota: Debes implementar este método en EncuestaService
        return ResponseEntity.ok(encuestaService.obtenerRespuestaPorId(responseId));
    }

    // Reenviar encuesta (HU-006)
    @PostMapping("/respuestas/{responseId}/resend")
    public ResponseEntity<Void> reenviarEncuesta(@PathVariable String responseId) {
        // Nota: Debes implementar este método en EncuestaService
        encuestaService.reenviarEncuesta(responseId);
        return ResponseEntity.accepted().build();
    }

    // Root: listar encuestas (resumen)
    @GetMapping
    public ResponseEntity<java.util.List<com.sqrc.module.backendsqrc.encuesta.dto.EncuestaSummaryDTO>> listarEncuestas() {
        return ResponseEntity.ok(encuestaService.listarEncuestas());
    }
}