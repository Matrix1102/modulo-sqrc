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
import java.time.temporal.ChronoUnit;
import java.util.Arrays;

@RestController
@Profile({"dev","local"})
@RequestMapping("/api/reportes")
public class MockReporteController {

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardKpisDTO> obtenerDashboardMock(
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        // Determine scale based on number of days requested (default base 30 days)
        long days = 30;
        if (startDate != null && endDate != null) {
            days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
            if (days <= 0) days = 1;
        }
        double factor = (double) days / 30.0;

        // base values (representan 30 días)
        int baseTotal = 24;
        int baseSolicitudes = 6;
        int baseReclamos = 10;
        int baseQuejas = 8;

        int totalCasos = Math.max(0, (int) Math.round(baseTotal * factor));
        int solicitudes = Math.max(0, (int) Math.round(baseSolicitudes * factor));
        int reclamos = Math.max(0, (int) Math.round(baseReclamos * factor));
        int quejas = Math.max(0, (int) Math.round(baseQuejas * factor));

        int baseAbiertos = 12;
        int baseResueltos = 10;
        int ticketsAbiertos = Math.max(0, (int) Math.round(baseAbiertos * factor));
        int ticketsResueltos = Math.max(0, (int) Math.round(baseResueltos * factor));

        // motivos
        int m1 = Math.max(0, (int) Math.round(8 * factor));
        int m2 = Math.max(0, (int) Math.round(7 * factor));
        int m3 = Math.max(0, (int) Math.round(7 * factor));
        int m4 = Math.max(0, (int) Math.round(8 * factor));

        // agentes tickets (scale)
        int a1 = Math.max(0, (int) Math.round(45 * factor));
        int a2 = Math.max(0, (int) Math.round(38 * factor));
        int a3 = Math.max(0, (int) Math.round(38 * factor));

        DashboardKpisDTO dto = DashboardKpisDTO.builder()
                .kpisGlobales(DashboardKpisDTO.KpisGlobalesDTO.builder()
                        .totalCasos(totalCasos)
                        .desgloseTipo(Arrays.asList(
                                DashboardKpisDTO.DesgloseTipoDTO.builder().tipo("Solicitudes").cantidad(solicitudes).build(),
                                DashboardKpisDTO.DesgloseTipoDTO.builder().tipo("Reclamos").cantidad(reclamos).build(),
                                DashboardKpisDTO.DesgloseTipoDTO.builder().tipo("Quejas").cantidad(quejas).build(),
                                DashboardKpisDTO.DesgloseTipoDTO.builder().tipo("Consultas").cantidad(Math.max(0, (int) Math.round(5 * factor))).build()
                        ))
                        .build())
                .kpisResumen(DashboardKpisDTO.KpisResumenDTO.builder()
                        .ticketsAbiertos(DashboardKpisDTO.KpiValorDTO.builder()
                                .valor(ticketsAbiertos)
                                .comparativoPeriodo((int) Math.round(8 * factor))
                                .comparativoPeriodoPct(null)
                                .build())
                        .ticketsResueltos(DashboardKpisDTO.KpiValorDTO.builder()
                                .valor(ticketsResueltos)
                                .comparativoPeriodo((int) Math.round(8 * factor))
                                .comparativoPeriodoPct(null)
                                .build())
                        .tiempoPromedio(DashboardKpisDTO.KpiValorDTO.builder()
                                .valor("2.4 hrs")
                                .comparativoPeriodo(null)
                                .comparativoPeriodoPct(-12)
                                .build())
                        .build())
                .motivosFrecuentes(Arrays.asList(
                        DashboardKpisDTO.MotivoFrecuenteDTO.builder().motivo("Retraso en entregas").cantidad(m1).build(),
                        DashboardKpisDTO.MotivoFrecuenteDTO.builder().motivo("Error en facturación").cantidad(m2).build(),
                        DashboardKpisDTO.MotivoFrecuenteDTO.builder().motivo("Problemas técnicos").cantidad(m3).build(),
                        DashboardKpisDTO.MotivoFrecuenteDTO.builder().motivo("Consulta general").cantidad(m4).build()
                ))
                .agentesMejorEvaluados(Arrays.asList(
                        DashboardKpisDTO.AgenteRankingDTO.builder().agenteId(1L).nombre("Andre Melendez").rating(4.8).tickets(a1).build(),
                        DashboardKpisDTO.AgenteRankingDTO.builder().agenteId(2L).nombre("Maria Gomez").rating(4.5).tickets(a2).build(),
                        DashboardKpisDTO.AgenteRankingDTO.builder().agenteId(3L).nombre("Juan Perez").rating(4.2).tickets(a3).build()
                ))
                .build();

        return ResponseEntity.ok(dto);
    }
}
