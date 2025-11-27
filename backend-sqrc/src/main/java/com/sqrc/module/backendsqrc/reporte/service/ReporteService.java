package com.sqrc.module.backendsqrc.reporte.service;

import com.sqrc.module.backendsqrc.reporte.builder.DashboardBuilder;
import com.sqrc.module.backendsqrc.reporte.dto.AgenteDetailDTO;
import com.sqrc.module.backendsqrc.reporte.dto.DashboardKpisDTO;
import com.sqrc.module.backendsqrc.reporte.model.*;
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
    // Si usas el dashboard de encuestas superior, inyecta también:
    // private final KpiDashboardEncuestasRepository encuestasRepo; 

    // --- 2. Inyección de la Fábrica del Builder (Patrón Prototype) ---
    private final ObjectFactory<DashboardBuilder> dashboardBuilderFactory;

    /**
     * Genera el Dashboard Principal consumiendo las tablas de KPI pre-calculadas.
     * Es una operación de lectura rápida (OLAP).
     */
    @Transactional(readOnly = true)
    public DashboardKpisDTO generarDashboard(LocalDate start, LocalDate end) {
        // A. Validar fechas (por defecto últimos 30 días si vienen nulas)
        if (start == null) start = LocalDate.now().minusDays(30);
        if (end == null) end = LocalDate.now();

        // B. Obtener datos de las tablas rápidas en paralelo (la BD lo maneja eficientemente)
        List<KpiResumenDiario> resumenes = resumenRepo.findByFechaBetween(start, end);
        List<KpiTiemposResolucion> tiempos = tiemposRepo.findByFechaBetween(start, end);
        List<KpiMotivosFrecuentes> motivos = motivosRepo.findByFechaBetween(start, end);
        List<KpiRendimientoAgenteDiario> agentes = agentesRepo.findByFechaBetween(start, end);

        // C. Obtener una nueva instancia limpia del Builder
        DashboardBuilder builder = dashboardBuilderFactory.getObject();

        // D. Construcción paso a paso (El Servicio actúa como Director)
        builder.reset();
        builder.construirKpisGlobales(resumenes);
        builder.construirResumenOperativo(resumenes, tiempos);
        builder.construirMotivosFrecuentes(motivos);
        builder.construirRankingAgentes(agentes);

        // E. Retornar el producto final ensamblado
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

        // 1. Traer los datos diarios de todos los agentes en el rango
        List<KpiRendimientoAgenteDiario> datosDiarios = agentesRepo.findByFechaBetween(start, end);

        // 2. Agrupar por ID de Agente para sumarizar sus estadísticas
        // (Un agente tiene N registros, uno por día)
        Map<Long, List<KpiRendimientoAgenteDiario>> porAgente = datosDiarios.stream()
                .collect(Collectors.groupingBy(KpiRendimientoAgenteDiario::getAgenteId));

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

            // Construir el DTO
            resultado.add(AgenteDetailDTO.builder()
                    .agenteId(agenteId.toString())
                    .nombre("Agente " + agenteId) // TODO: Podrías llamar a un UsuarioService.obtenerNombre(id) si quieres el nombre real
                    .volumenTotalAtendido(totalTickets)
                    .csatPromedio(Math.round(csatPromedio * 10.0) / 10.0) // Redondear a 1 decimal
                    .tiempoPromedioResolucion(formatMinutosAHoras(tiempoPromedioMin))
                    .cumplimientoSlaPct(95.0) // Dato dummy o calcular si tienes la columna de SLA
                    .build());
        });

        return resultado;
    }

    // Método utilitario simple
    private String formatMinutosAHoras(double minutos) {
        if (minutos < 60) {
            return String.format("%.0f min", minutos);
        }
        return String.format("%.1f h", minutos / 60);
    }
}