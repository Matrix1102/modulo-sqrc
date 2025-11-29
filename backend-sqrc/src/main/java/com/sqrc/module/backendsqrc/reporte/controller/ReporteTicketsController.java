package com.sqrc.module.backendsqrc.reporte.controller;

import com.sqrc.module.backendsqrc.reporte.dto.AgentTicketsDTO;
import com.sqrc.module.backendsqrc.reporte.service.ReporteTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.mock.reportes", havingValue = "false", matchIfMissing = true)
public class ReporteTicketsController {

    private final ReporteTicketService reporteTicketService;

    @GetMapping("/tickets/agente/{agenteId}")
    public ResponseEntity<AgentTicketsDTO> obtenerTicketsPorAgente(
            @PathVariable("agenteId") String agenteId,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        AgentTicketsDTO dto = reporteTicketService.obtenerTicketsPorAgente(agenteId, startDate, endDate);
        return ResponseEntity.ok(dto);
    }
}
