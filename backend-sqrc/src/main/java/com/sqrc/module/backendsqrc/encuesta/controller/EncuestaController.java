package com.sqrc.module.backendsqrc.encuesta.controller;

import com.sqrc.module.backendsqrc.encuesta.dto.*; // Importa tus DTOs
import com.sqrc.module.backendsqrc.encuesta.service.EncuestaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class EncuestaController {

    private final EncuestaService encuestaService;

    // ==========================================
    // 1. Gestión de Plantillas (Survey Templates)
    // ==========================================

    @GetMapping("/survey-templates")
    public ResponseEntity<List<PlantillaResponseDTO>> listarPlantillas() {
        List<PlantillaResponseDTO> plantillas = encuestaService.listarPlantillas();
        return ResponseEntity.ok(plantillas); 
    }

    @PostMapping("/survey-templates")
    public ResponseEntity<PlantillaResponseDTO> crearPlantilla(@RequestBody PlantillaRequestDTO request) {
        PlantillaResponseDTO plantillaCreada = encuestaService.crearPlantilla(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(plantillaCreada);
    }

    @GetMapping("/survey-templates/{templateId}")
    public ResponseEntity<PlantillaResponseDTO> obtenerPlantilla(@PathVariable String templateId) {
        PlantillaResponseDTO plantilla = encuestaService.obtenerPlantillaPorId(templateId);
        return ResponseEntity.ok(plantilla);
    }

    // ==========================================
    // 2. Dashboard de Encuestas
    // ==========================================

    @GetMapping("/surveys/dashboard")
    public ResponseEntity<SurveyDashboardDTO> obtenerDashboardEncuestas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        SurveyDashboardDTO dashboard = encuestaService.obtenerKpisEncuestas(startDate, endDate);
        return ResponseEntity.ok(dashboard);
    }

    // ==========================================
    // 3. Gestión de Respuestas (Survey Responses)
    // ==========================================

    @PostMapping("/survey-responses")
    public ResponseEntity<String> recibirRespuesta(@RequestBody RespuestaClienteDTO respuesta) {
        encuestaService.guardarRespuesta(respuesta);
        return ResponseEntity.ok("Respuesta recibida correctamente");
    }
}