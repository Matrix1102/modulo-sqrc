package com.sqrc.module.backendsqrc.reporte.controller;

import com.sqrc.module.backendsqrc.reporte.dto.DashboardKpisDTO;
import com.sqrc.module.backendsqrc.reporte.dto.AgenteDetailDTO;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.PathVariable;
import com.sqrc.module.backendsqrc.reporte.dto.AgentTicketsDTO;
import com.sqrc.module.backendsqrc.reporte.dto.TicketReporteDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/reportes")
@ConditionalOnProperty(name = "app.mock.reportes", havingValue = "true")
public class MockReporteController {

        private static final Logger logger = LoggerFactory.getLogger(MockReporteController.class);

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardKpisDTO> obtenerDashboardMock(
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
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
        } catch (Exception e) {
            logger.error("Error generating mock dashboard", e);
            return ResponseEntity.status(500).body(null);
        }
    }

        @GetMapping("/tickets/agente/{agenteId}")
        public ResponseEntity<AgentTicketsDTO> obtenerTicketsPorAgenteMock(
                        @PathVariable("agenteId") String agenteId,
                        @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
        ) {
                try {
                        long days = 30;
                        if (startDate != null && endDate != null) {
                                days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
                                if (days <= 0) days = 1;
                        }
                        double factor = (double) days / 30.0;

                        int ticketsCount = Math.max(0, (int) Math.round(8 * factor));

                        // build synthetic tickets with more realistic motives and client names
                        List<TicketReporteDTO> tickets = new java.util.ArrayList<>();
                        String[] sampleMotives = new String[] {
                                "Cobro doble",
                                "Producto faltante",
                                "Entrega tardía",
                                "Error en facturación",
                                "Cuenta bloqueada",
                                "Problema con la garantía",
                                "Cambio de plan",
                                "Solicitud de reembolso",
                                "Incidencia técnica"
                        };

                        String[] sampleClients = new String[] {
                                "Juan Pérez",
                                "María Ruiz",
                                "Carlos López",
                                "Ana Gómez",
                                "Luis Fernández",
                                "Sofía Torres",
                                "Diego Ramírez",
                                "Valeria Díaz",
                                "Andrés Castro"
                        };

                        for (int i = 0; i < ticketsCount; i++) {
                                String motive = sampleMotives[i % sampleMotives.length];
                                String client = sampleClients[i % sampleClients.length];
                                tickets.add(TicketReporteDTO.builder()
                                                .id("T-" + agenteId + "-" + (1000 + i))
                                                .client(client)
                                                .motive(motive)
                                                .date(LocalDate.now().minusDays(i % 30).toString())
                                                .status(i % 4 == 0 ? "ABIERTO" : "CERRADO")
                                                .build());
                        }

                        // map agenteId to a friendly name when possible
                        String agenteNombre;
                        switch (agenteId) {
                                case "1": agenteNombre = "Andre Melendez"; break;
                                case "2": agenteNombre = "Maria Gomez"; break;
                                case "3": agenteNombre = "Juan Perez"; break;
                                default: agenteNombre = "Agente " + agenteId; break;
                        }

                        AgentTicketsDTO resp = AgentTicketsDTO.builder()
                                        .agenteId(agenteId)
                                        .agenteNombre(agenteNombre)
                                        .tickets(tickets)
                                        .build();

                        return ResponseEntity.ok(resp);
                } catch (Exception e) {
                        logger.error("Error generating mock tickets for agent {}", agenteId, e);
                        return ResponseEntity.status(500).body(null);
                }
        }

        @GetMapping("/agentes")
        public ResponseEntity<List<AgenteDetailDTO>> obtenerAgentesMock(
                        @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
        ) {
                try {
                        long days = 30;
                        if (startDate != null && endDate != null) {
                                days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
                                if (days <= 0) days = 1;
                        }
                        double factor = (double) days / 30.0;

                        int a1 = Math.max(0, (int) Math.round(45 * factor));
                        int a2 = Math.max(0, (int) Math.round(38 * factor));
                        int a3 = Math.max(0, (int) Math.round(38 * factor));

                        List<AgenteDetailDTO> agentes = Arrays.asList(
                                        AgenteDetailDTO.builder()
                                                        .agenteId("1")
                                                        .nombre("Andre Melendez")
                                                        .volumenTotalAtendido(a1)
                                                        .csatPromedio(4.8)
                                                        .tiempoPromedioResolucion("1.2 h")
                                                        .cumplimientoSlaPct(95.0)
                                                        .build(),
                                        AgenteDetailDTO.builder()
                                                        .agenteId("2")
                                                        .nombre("Maria Gomez")
                                                        .volumenTotalAtendido(a2)
                                                        .csatPromedio(4.5)
                                                        .tiempoPromedioResolucion("1.5 h")
                                                        .cumplimientoSlaPct(93.5)
                                                        .build(),
                                        AgenteDetailDTO.builder()
                                                        .agenteId("3")
                                                        .nombre("Juan Perez")
                                                        .volumenTotalAtendido(a3)
                                                        .csatPromedio(4.2)
                                                        .tiempoPromedioResolucion("2.0 h")
                                                        .cumplimientoSlaPct(90.0)
                                                        .build()
                        );

                        return ResponseEntity.ok(agentes);
                } catch (Exception e) {
                        logger.error("Error generating mock agentes list", e);
                        return ResponseEntity.status(500).body(null);
                }
        }
}
