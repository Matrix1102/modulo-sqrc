package com.sqrc.module.backendsqrc.reporte.builder;

import com.sqrc.module.backendsqrc.reporte.dto.DashboardKpisDTO;
import com.sqrc.module.backendsqrc.reporte.model.*;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Scope("prototype")
public class DashboardBuilderImpl implements DashboardBuilder {

    private DashboardKpisDTO reporte;

    @Override
    public void reset() {
        this.reporte = DashboardKpisDTO.builder().build();
    }

    @Override
    public void construirKpisGlobales(List<KpiResumenDiario> resumenes) {
        // Lógica simple: Sumar los totales de los días consultados
        int totalCasos = resumenes.stream()
                .mapToInt(KpiResumenDiario::getTotalCasosCreados)
                .sum();

        // Agrupar por TipoCaso para el gráfico de torta
        Map<TipoCaso, Integer> porTipo = resumenes.stream()
                .collect(Collectors.groupingBy(
                        KpiResumenDiario::getTipoCaso,
                        Collectors.summingInt(KpiResumenDiario::getTotalCasosCreados)
                ));

        List<DashboardKpisDTO.DesgloseTipoDTO> desglose = new ArrayList<>();
        porTipo.forEach((tipo, cantidad) -> 
            desglose.add(DashboardKpisDTO.DesgloseTipoDTO.builder()
                    .tipo(tipo.name())
                    .cantidad(cantidad)
                    .build())
        );

        this.reporte.setKpisGlobales(DashboardKpisDTO.KpisGlobalesDTO.builder()
                .totalCasos(totalCasos)
                .desgloseTipo(desglose)
                .build());
    }

    @Override
    public void construirResumenOperativo(List<KpiResumenDiario> resumenes, List<KpiTiemposResolucion> tiempos) {
        // Calcular totales: creados y resueltos sumando la columna de la tabla KPI
        int totalCreados = resumenes.stream()
                .mapToInt(KpiResumenDiario::getTotalCasosCreados)
                .sum();

        int totalResueltos = resumenes.stream()
                .mapToInt(KpiResumenDiario::getTotalCasosResueltos)
                .sum();

        // Calcular promedio de tiempo (promedio de promedios ponderados simplificado)
        double tiempoPromedioGlobal = tiempos.stream()
                .mapToInt(KpiTiemposResolucion::getTiempoPromedioResolucionTotalMin)
                .average()
                .orElse(0.0);

        // Calcular abiertos como creados - resueltos
        int ticketsAbiertos = Math.max(0, totalCreados - totalResueltos);

        this.reporte.setKpisResumen(DashboardKpisDTO.KpisResumenDTO.builder()
                .ticketsAbiertos(DashboardKpisDTO.KpiValorDTO.builder()
                        .valor(ticketsAbiertos)
                        .comparativoPeriodo("+0")
                        .build())
                .ticketsResueltos(DashboardKpisDTO.KpiValorDTO.builder()
                        .valor(totalResueltos)
                        .comparativoPeriodo("+5%") // Esto podrías calcularlo trayendo el mes anterior
                        .build())
                .tiempoPromedio(DashboardKpisDTO.KpiValorDTO.builder()
                        .valor(String.format("%.1f hrs", tiempoPromedioGlobal / 60))
                        .build())
                .build());
    }

    @Override
    public void construirMotivosFrecuentes(List<KpiMotivosFrecuentes> motivos) {
        // Agrupar por motivo ID y sumar conteos
        // (Porque si pides un rango de 30 días, el mismo motivo aparecerá 30 veces)
        Map<Long, Integer> agrupado = motivos.stream()
                .collect(Collectors.groupingBy(
                        KpiMotivosFrecuentes::getIdMotivo,
                        Collectors.summingInt(KpiMotivosFrecuentes::getConteoTotal)
                ));

        List<DashboardKpisDTO.MotivoFrecuenteDTO> listaFinal = new ArrayList<>();
        
        // Aquí necesitarías un map de ID -> NombreMotivo (o haber guardado el nombre en la tabla KPI)
        agrupado.forEach((id, total) -> {
            listaFinal.add(DashboardKpisDTO.MotivoFrecuenteDTO.builder()
                    .motivo("Motivo ID " + id) // Idealmente usarías el nombre real
                    .cantidad(total)
                    .build());
        });

        // Ordenar top 5
        listaFinal.sort((a, b) -> b.getCantidad().compareTo(a.getCantidad()));
        
        this.reporte.setMotivosFrecuentes(listaFinal);
    }

    @Override
    public void construirRankingAgentes(List<KpiRendimientoAgenteDiario> ranking) {
        // Similar: Agrupar por agente y promediar su CSAT / Sumar sus tickets
        Map<Long, Double> csatPorAgente = ranking.stream()
                .collect(Collectors.groupingBy(
                        KpiRendimientoAgenteDiario::getAgenteId,
                        Collectors.averagingDouble(KpiRendimientoAgenteDiario::getCsatPromedioAgente)
                ));

        // Sumar tickets por agente
        Map<Long, Integer> ticketsPorAgente = ranking.stream()
                .collect(Collectors.groupingBy(
                        KpiRendimientoAgenteDiario::getAgenteId,
                        Collectors.summingInt(KpiRendimientoAgenteDiario::getTicketsResueltosTotal)
                ));

        List<DashboardKpisDTO.AgenteRankingDTO> topAgentes = new ArrayList<>();
        
        csatPorAgente.forEach((id, csat) -> {
            Integer tickets = ticketsPorAgente.getOrDefault(id, 0);
            topAgentes.add(DashboardKpisDTO.AgenteRankingDTO.builder()
                    .agenteId(id)
                    .nombre("Agente " + id) // O buscar nombre real
                    .rating(Math.round(csat * 10.0) / 10.0)
                    .tickets(tickets)
                    .build());
        });

        // Ordenar por rating descendente y limitar (top N)
        topAgentes.sort((a, b) -> Double.compare(b.getRating(), a.getRating()));

        this.reporte.setAgentesMejorEvaluados(topAgentes);
    }

    @Override
    public DashboardKpisDTO getResultado() {
        return this.reporte;
    }
}