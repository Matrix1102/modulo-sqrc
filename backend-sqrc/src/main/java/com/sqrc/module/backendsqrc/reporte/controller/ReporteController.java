package com.sqrc.module.backendsqrc.reporte.controller;

import com.sqrc.module.backendsqrc.reporte.dto.*;
import com.sqrc.module.backendsqrc.reporte.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.mock.reportes", havingValue = "false", matchIfMissing = true)
public class ReporteController {

    private final ReporteService reporteService;

    // 1. Ver Dashboard (JSON)
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardKpisDTO> obtenerDashboardGeneral(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(reporteService.generarDashboard(startDate, endDate));
    }

    // 2. Ver Tabla de Agentes (JSON)
    @GetMapping("/agentes")
    public ResponseEntity<List<AgenteDetailDTO>> obtenerMetricasAgentes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(reporteService.obtenerMetricasAgentes(startDate, endDate));
    }
    
    // KPIs de Encuestas
    @GetMapping("/encuestas")
    public ResponseEntity<com.sqrc.module.backendsqrc.reporte.dto.SurveyDashboardDTO> obtenerMetricasEncuestas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(reporteService.obtenerMetricasEncuestas(startDate, endDate));
    }
    
    // ¡ADIÓS al endpoint /exportar!
}