package com.sqrc.module.backendsqrc.reporte.service;

import com.sqrc.module.backendsqrc.reporte.builder.DashboardBuilder;
import com.sqrc.module.backendsqrc.reporte.dto.AgenteDetailDTO;
import com.sqrc.module.backendsqrc.reporte.dto.DashboardKpisDTO;
import com.sqrc.module.backendsqrc.reporte.model.*;
import com.sqrc.module.backendsqrc.reporte.dto.SurveyDashboardDTO;
import com.sqrc.module.backendsqrc.reporte.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteService {

    // --- 1. Inyección de Repositorios de Reportes (Tablas Desconectadas) ---
    private final KpiResumenDiarioRepository resumenRepo;
    private final KpiTiemposResolucionRepository tiemposRepo;
    private final KpiMotivosFrecuentesRepository motivosRepo;
    private final KpiRendimientoAgenteDiarioRepository agentesRepo;
    // KPI encuestas
    private final com.sqrc.module.backendsqrc.reporte.repository.KpiDashboardEncuestasRepository encuestasRepo;

    // SLA service
    private final com.sqrc.module.backendsqrc.reporte.service.SlaService slaService;

    // --- 2. Inyección de la Fábrica del Builder (Patrón Prototype) ---
    private final ObjectFactory<DashboardBuilder> dashboardBuilderFactory;

    /**
     * Genera el Dashboard Principal consumiendo las tablas de KPI pre-calculadas.
     * Es una operación de lectura rápida (OLAP).
     */
    @Transactional(readOnly = true)
    public DashboardKpisDTO generarDashboard(LocalDate start, LocalDate end) {
        // A. Validar fechas y determinar comportamiento por defecto
        LocalDate hoy = LocalDate.now();

        // Si no vienen fechas: por defecto traer sólo HOY y comparar con AYER
        if (start == null && end == null) {
            start = hoy;
            end = hoy;
        }

        // Normalize: si solo falta start o end, tratamos como rango puntual
        if (start == null && end != null) {
            start = end;
        }
        if (end == null && start != null) {
            end = start;
        }

        // B. Determinar período anterior según reglas solicitadas:
        // - Si el rango es exactamente HOY -> comparar con AYER
        // - Si el rango cubre desde inicio de la semana actual hasta hoy ("esta semana") -> comparar con semana anterior
        // - Si el rango cubre desde primer día del mes actual hasta hoy ("este mes") -> comparar con mes anterior
        // - En cualquier otro caso (rango personalizado) -> comparar con periodo anterior de igual duración

        LocalDate startAnterior;
        LocalDate endAnterior;

        LocalDate inicioSemanaActual = hoy.with(java.time.DayOfWeek.MONDAY);
        LocalDate primerDiaMesActual = hoy.withDayOfMonth(1);

        boolean isHoy = start.equals(hoy) && end.equals(hoy);
        boolean isEstaSemana = start.equals(inicioSemanaActual) && (end.equals(hoy) || end.equals(inicioSemanaActual.plusDays(6)));
        boolean isEsteMes = start.equals(primerDiaMesActual) && (end.equals(hoy) || end.equals(primerDiaMesActual.withDayOfMonth(primerDiaMesActual.lengthOfMonth())));

        if (isHoy) {
            startAnterior = hoy.minusDays(1);
            endAnterior = hoy.minusDays(1);
        } else if (isEstaSemana) {
            startAnterior = start.minusWeeks(1);
            endAnterior = end.minusWeeks(1);
        } else if (isEsteMes) {
            // Periodo: mes completo anterior
            LocalDate primerDiaMesPrev = primerDiaMesActual.minusMonths(1).withDayOfMonth(1);
            LocalDate ultimoDiaMesPrev = primerDiaMesActual.minusMonths(1).withDayOfMonth(primerDiaMesActual.minusMonths(1).lengthOfMonth());
            startAnterior = primerDiaMesPrev;
            endAnterior = ultimoDiaMesPrev;
        } else {
            long diasEnRango = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
            startAnterior = start.minusDays(diasEnRango);
            endAnterior = start.minusDays(1);
        }

        // C. Obtener datos del período actual
        List<KpiResumenDiario> resumenes = resumenRepo.findByFechaBetween(start, end);
        List<KpiTiemposResolucion> tiempos = tiemposRepo.findByFechaBetween(start, end);
        List<KpiMotivosFrecuentes> motivos = motivosRepo.findByFechaBetween(start, end);
        List<KpiRendimientoAgenteDiario> agentes = agentesRepo.findByFechaBetween(start, end);

        // D. Obtener datos del período anterior (para comparación)
        List<KpiResumenDiario> resumenesAnterior = resumenRepo.findByFechaBetween(startAnterior, endAnterior);
        List<KpiTiemposResolucion> tiemposAnterior = tiemposRepo.findByFechaBetween(startAnterior, endAnterior);

        // E. Obtener una nueva instancia limpia del Builder
        DashboardBuilder builder = dashboardBuilderFactory.getObject();

        // F. Construcción paso a paso (El Servicio actúa como Director)
        builder.reset();
        builder.construirKpisGlobales(resumenes);
        builder.construirResumenOperativo(resumenes, tiempos, resumenesAnterior, tiemposAnterior);
        builder.construirMotivosFrecuentes(motivos);
        builder.construirRankingAgentes(agentes);

        // G. Retornar el producto final ensamblado
        return builder.getResultado();
    }

    /**
     * Genera la tabla detallada de agentes.
     * Ahora usa datos reales de la tabla 'kpi_rendimiento_agente_diario'.
     */
    @Transactional(readOnly = true)
    public List<AgenteDetailDTO> obtenerMetricasAgentes(LocalDate start, LocalDate end) {
        if (start == null) start = LocalDate.now().minusDays(30);
        if (end == null) end = LocalDate.now();

        // 1. Traer los datos diarios de todos los agentes en el rango (con JOIN FETCH para cargar nombres)
        List<KpiRendimientoAgenteDiario> datosDiarios = agentesRepo.findByFechaBetweenWithAgente(start, end);

        // 2. Agrupar por ID de Agente para sumarizar sus estadísticas
        // (Un agente tiene N registros, uno por día)
        Map<Long, List<KpiRendimientoAgenteDiario>> porAgente = datosDiarios.stream()
                .collect(Collectors.groupingBy(kpi -> kpi.getAgente().getIdEmpleado()));

        List<AgenteDetailDTO> resultado = new ArrayList<>();

        porAgente.forEach((agenteId, registros) -> {
            // Calcular totales y promedios para este agente en el periodo
            int totalTickets = registros.stream().mapToInt(KpiRendimientoAgenteDiario::getTicketsResueltosTotal).sum();
            
            double csatPromedio = registros.stream()
                    .mapToDouble(KpiRendimientoAgenteDiario::getCsatPromedioAgente)
                    .average().orElse(0.0);
            
            double tiempoPromedioMin = registros.stream()
                    .mapToInt(KpiRendimientoAgenteDiario::getTiempoPromedioResolucionMinutos)
                    .average().orElse(0.0);

            // Obtener el nombre real del agente desde la entidad relacionada
            String nombreAgente = registros.stream()
                    .findFirst()
                    .map(kpi -> kpi.getAgente().getNombreCompleto())
                    .orElse("Agente " + agenteId);

            // Construir el DTO
                double slaPct = slaService.computeCumplimientoFromDailyKpis(registros, null);

                resultado.add(AgenteDetailDTO.builder()
                    .agenteId(agenteId.toString())
                    .nombre(nombreAgente)
                    .volumenTotalAtendido(totalTickets)
                    .csatPromedio(Math.round(csatPromedio * 10.0) / 10.0) // Redondear a 1 decimal
                    .tiempoPromedioResolucion(formatMinutosAHoras(tiempoPromedioMin))
                    .cumplimientoSlaPct(slaPct)
                    .build());
        });

        return resultado;
    }

        /**
         * Obtiene métricas globales de encuestas (CSAT, total respuestas, tasa)
         * usando la tabla `kpi_dashboard_encuestas` precalculada.
         */
        @Transactional(readOnly = true)
        public SurveyDashboardDTO obtenerMetricasEncuestas(LocalDate start, LocalDate end) {
        if (start == null) start = LocalDate.now().minusDays(30);
        if (end == null) end = LocalDate.now();

        List<com.sqrc.module.backendsqrc.reporte.model.KpiDashboardEncuestas> datos = encuestasRepo.findByFechaBetween(start, end);

        if (datos.isEmpty()) {
            return SurveyDashboardDTO.builder()
                .csatPromedioAgente(0.0)
                .csatPromedioServicio(0.0)
                .totalRespuestas(0)
                .tasaRespuestaPct(0.0)
                .build();
        }

        double csatAgenteAvg = datos.stream()
            .mapToDouble(d -> d.getCsatPromedioAgenteGlobal() != null ? d.getCsatPromedioAgenteGlobal() : 0.0)
            .average().orElse(0.0);

        double csatServicioAvg = datos.stream()
            .mapToDouble(d -> d.getCsatPromedioServicioGlobal() != null ? d.getCsatPromedioServicioGlobal() : 0.0)
            .average().orElse(0.0);

        int totalRespuestas = datos.stream()
            .mapToInt(d -> d.getTotalRespuestasGlobal() != null ? d.getTotalRespuestasGlobal() : 0)
            .sum();

        // tasaRespuestaGlobal stored as fraction (e.g., 0.15). Compute average and convert to percentage.
        double tasaAvg = datos.stream()
            .mapToDouble(d -> d.getTasaRespuestaGlobal() != null ? d.getTasaRespuestaGlobal() : 0.0)
            .average().orElse(0.0) * 100.0;

        return SurveyDashboardDTO.builder()
            .csatPromedioAgente(Math.round(csatAgenteAvg * 10.0) / 10.0)
            .csatPromedioServicio(Math.round(csatServicioAvg * 10.0) / 10.0)
            .totalRespuestas(totalRespuestas)
            .tasaRespuestaPct(Math.round(tasaAvg * 10.0) / 10.0)
            .build();
        }

    // Método utilitario simple
    private String formatMinutosAHoras(double minutos) {
        if (minutos < 60) {
            return String.format("%.0f min", minutos);
        }
        return String.format("%.1f h", minutos / 60);
    }
}