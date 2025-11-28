package com.sqrc.module.backendsqrc.reporte.controller;

import com.sqrc.module.backendsqrc.reporte.dto.DashboardKpisDTO;
import org.springframework.context.annotation.Profile;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Arrays;

@RestController
@Profile({"dev","local"})
@RequestMapping("/api/reportes")
public class MockReporteController {

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardKpisDTO> obtenerDashboardMock(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        // Mock estático que respeta la forma solicitada por el frontend
        DashboardKpisDTO dto = DashboardKpisDTO.builder()
                .kpisGlobales(DashboardKpisDTO.KpisGlobalesDTO.builder()
                        .totalCasos(24)
                        .desgloseTipo(Arrays.asList(
                                DashboardKpisDTO.DesgloseTipoDTO.builder().tipo("Solicitudes").cantidad(6).build(),
                                DashboardKpisDTO.DesgloseTipoDTO.builder().tipo("Reclamos").cantidad(10).build(),
                                DashboardKpisDTO.DesgloseTipoDTO.builder().tipo("Quejas").cantidad(8).build()
                        ))
                        .build())
                .kpisResumen(DashboardKpisDTO.KpisResumenDTO.builder()
                        .ticketsAbiertos(DashboardKpisDTO.KpiValorDTO.builder()
                                .valor(12)
                                .comparativoPeriodo("+8")
                                .build())
                        .ticketsResueltos(DashboardKpisDTO.KpiValorDTO.builder()
                                .valor(10)
                                .comparativoPeriodo("+8")
                                .build())
                        .tiempoPromedio(DashboardKpisDTO.KpiValorDTO.builder()
                                .valor("2.4 hrs")
                                .comparativoPeriodoPct(-12)
                                .build())
                        .build())
                .motivosFrecuentes(Arrays.asList(
                        DashboardKpisDTO.MotivoFrecuenteDTO.builder().motivo("Retraso en entregas").cantidad(8).build(),
                        DashboardKpisDTO.MotivoFrecuenteDTO.builder().motivo("Error en facturación").cantidad(7).build(),
                        DashboardKpisDTO.MotivoFrecuenteDTO.builder().motivo("Problemas técnicos").cantidad(7).build(),
                        DashboardKpisDTO.MotivoFrecuenteDTO.builder().motivo("Consulta general").cantidad(8).build()
                ))
                .agentesMejorEvaluados(Arrays.asList(
                        DashboardKpisDTO.AgenteRankingDTO.builder().agenteId(1L).nombre("Andre Melendez").rating(4.8).tickets(45).build(),
                        DashboardKpisDTO.AgenteRankingDTO.builder().agenteId(2L).nombre("Maria Gomez").rating(4.5).tickets(38).build(),
                        DashboardKpisDTO.AgenteRankingDTO.builder().agenteId(3L).nombre("Juan Perez").rating(4.2).tickets(38).build()
                ))
                .build();

        return ResponseEntity.ok(dto);
    }
}
