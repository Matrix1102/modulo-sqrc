package com.sqrc.module.backendsqrc.reporte.builder;

import com.sqrc.module.backendsqrc.reporte.dto.DashboardKpisDTO;
import com.sqrc.module.backendsqrc.reporte.model.*;
import com.sqrc.module.backendsqrc.ticket.model.Motivo;
import com.sqrc.module.backendsqrc.ticket.model.Agente;
import com.sqrc.module.backendsqrc.ticket.repository.MotivoRepository;
import com.sqrc.module.backendsqrc.ticket.repository.AgenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Scope("prototype")
@RequiredArgsConstructor
public class DashboardBuilderImpl implements DashboardBuilder {

    private final MotivoRepository motivoRepository;
    private final AgenteRepository agenteRepository;
    
    private DashboardKpisDTO reporte;

    @Override
    public void reset() {
        this.reporte = DashboardKpisDTO.builder().build();
    }

    @Override
    public void construirKpisGlobales(List<KpiResumenDiario> resumenes) {
        // totalCasos will be computed from the derived porTipoGlobal (the values we display)
        int totalCasos;
        // Agrupar por TipoCaso de forma global y por canal para permitir desglose por canal
        // Agrupar por canal -> tipo -> suma (primero filtramos tipos nulos para que no aparezca "Sin tipo")
        // Exclude rows with null canal or canal == 'GLOBAL' from per-channel grouping
        // We'll derive the GLOBAL bucket by summing the real channels (PRESENCIAL, LLAMADA, ...)
        Map<String, Map<String, Integer>> porCanalTipo = resumenes.stream()
                .filter(r -> r.getTipoCaso() != null && r.getCanal() != null && !"GLOBAL".equalsIgnoreCase(r.getCanal()))
                .collect(Collectors.groupingBy(
                        r -> r.getCanal().toUpperCase(),
                        Collectors.groupingBy(
                                r -> mapTipoLabel(r.getTipoCaso().name()),
                                Collectors.summingInt(KpiResumenDiario::getTotalCasosCreados)
                        )
                ));

                // Derivar porTipoGlobal sumando los valores por canal para evitar discrepancias
        Map<String, Integer> porTipoGlobal = new java.util.HashMap<>();
        porCanalTipo.values().forEach(mapTipo -> {
            mapTipo.forEach((tipo, cantidad) -> porTipoGlobal.merge(tipo, cantidad, Integer::sum));
        });

                // Compute totalCasos as the sum of the displayed global breakdown
                totalCasos = porTipoGlobal.values().stream().mapToInt(Integer::intValue).sum();

        java.util.Map<String, List<DashboardKpisDTO.DesgloseTipoDTO>> desglosePorCanal = new java.util.HashMap<>();

                // Global breakdown
                List<DashboardKpisDTO.DesgloseTipoDTO> globalList = new ArrayList<>();
                porTipoGlobal.forEach((tipo, cantidad) -> globalList.add(DashboardKpisDTO.DesgloseTipoDTO.builder().tipo(tipo).cantidad(cantidad).build()));

                                // Ensure common categories are present globally (add missing with 0)
                                java.util.List<String> expectedTipos = java.util.Arrays.asList("Solicitudes", "Consultas", "Quejas", "Reclamos");
                                for (String tipoEsperado : expectedTipos) {
                                        if (globalList.stream().noneMatch(d -> d.getTipo() != null && d.getTipo().equalsIgnoreCase(tipoEsperado))) {
                                                globalList.add(DashboardKpisDTO.DesgloseTipoDTO.builder().tipo(tipoEsperado).cantidad(0).build());
                                        }
                                }

                                desglosePorCanal.put("GLOBAL", globalList);

                // Per-canal breakdowns
                // Ensure expected channels exist even if absent in the KPI rows
                java.util.List<String> expectedCanales = java.util.Arrays.asList("PRESENCIAL", "LLAMADA");
                for (String c : expectedCanales) {
                    porCanalTipo.putIfAbsent(c, new java.util.HashMap<>());
                }

                porCanalTipo.forEach((canal, mapTipo) -> {
                        List<DashboardKpisDTO.DesgloseTipoDTO> lst = new ArrayList<>();
                        mapTipo.forEach((tipo, cantidad) -> lst.add(DashboardKpisDTO.DesgloseTipoDTO.builder().tipo(tipo).cantidad(cantidad).build()));

                        // Ensure common categories appear for each canal even if 0
                        for (String tipoEsperado : expectedTipos) {
                            if (lst.stream().noneMatch(d -> d.getTipo() != null && d.getTipo().equalsIgnoreCase(tipoEsperado))) {
                                lst.add(DashboardKpisDTO.DesgloseTipoDTO.builder().tipo(tipoEsperado).cantidad(0).build());
                            }
                        }

                        desglosePorCanal.put(canal, lst);
                });

        this.reporte.setKpisGlobales(DashboardKpisDTO.KpisGlobalesDTO.builder()
                .totalCasos(totalCasos)
                .desglosePorCanal(desglosePorCanal)
                .build());
    }

        // Helper to map raw tipo codes to presentation labels
        private String mapTipoLabel(String raw) {
                if (raw == null) return "Sin tipo";
                String key = raw.trim().toUpperCase();
                switch (key) {
                        case "SOLICITUD":
                        case "SOLICITUDES":
                                return "Solicitudes";
                        case "CONSULTA":
                        case "CONSULTAS":
                                return "Consultas";
                        case "QUEJA":
                        case "QUEJAS":
                                return "Quejas";
                        case "RECLAMO":
                        case "RECLAMOS":
                                return "Reclamos";
                        default:
                                // Capitalize first letter and lowercase the rest for unknown types
                                String lower = raw.toLowerCase();
                                return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
                }
        }

    @Override
    public void construirResumenOperativo(List<KpiResumenDiario> resumenes, List<KpiTiemposResolucion> tiempos,
                                          List<KpiResumenDiario> resumenesAnterior, List<KpiTiemposResolucion> tiemposAnterior) {
        // ========== PERÍODO ACTUAL ==========
        // Exclude KPI rows with canal == 'GLOBAL' or null when building per-canal summaries
        Map<String, Integer> totalCreadosPorCanal = resumenes.stream()
                .filter(r -> r.getCanal() != null && !"GLOBAL".equalsIgnoreCase(r.getCanal()))
                .collect(Collectors.groupingBy(r -> r.getCanal().toUpperCase(), Collectors.summingInt(KpiResumenDiario::getTotalCasosCreados)));

        Map<String, Integer> totalResueltosPorCanal = resumenes.stream()
                .filter(r -> r.getCanal() != null && !"GLOBAL".equalsIgnoreCase(r.getCanal()))
                .collect(Collectors.groupingBy(r -> r.getCanal().toUpperCase(), Collectors.summingInt(KpiResumenDiario::getTotalCasosResueltos)));

        Map<String, Double> tiempoPromedioPorCanal = tiempos.stream()
                .filter(r -> r.getCanal() != null && !"GLOBAL".equalsIgnoreCase(r.getCanal()))
                .collect(Collectors.groupingBy(r -> r.getCanal().toUpperCase(), Collectors.averagingDouble(KpiTiemposResolucion::getTiempoPromedioResolucionTotalMin)));

        // ========== PERÍODO ANTERIOR (para comparación) ==========
        Map<String, Integer> totalCreadosAnteriorPorCanal = resumenesAnterior.stream()
                .collect(Collectors.groupingBy(r -> r.getCanal() != null ? r.getCanal().toUpperCase() : "OTRO", Collectors.summingInt(KpiResumenDiario::getTotalCasosCreados)));

        Map<String, Integer> totalResueltosAnteriorPorCanal = resumenesAnterior.stream()
                .collect(Collectors.groupingBy(r -> r.getCanal() != null ? r.getCanal().toUpperCase() : "OTRO", Collectors.summingInt(KpiResumenDiario::getTotalCasosResueltos)));

        Map<String, Double> tiempoPromedioAnteriorPorCanal = tiemposAnterior.stream()
                .collect(Collectors.groupingBy(r -> r.getCanal() != null ? r.getCanal().toUpperCase() : "OTRO", Collectors.averagingDouble(KpiTiemposResolucion::getTiempoPromedioResolucionTotalMin)));

        java.util.Map<String, DashboardKpisDTO.KpisResumenDTO> resumenMap = new java.util.HashMap<>();

        // ========== GLOBAL ACTUAL ==========
        // Derive GLOBAL metrics by summing the per-channel results (avoids relying on precomputed GLOBAL rows)
        int totalCreadosGlobal = totalCreadosPorCanal.values().stream().mapToInt(Integer::intValue).sum();
        int totalResueltosGlobal = totalResueltosPorCanal.values().stream().mapToInt(Integer::intValue).sum();
        double tiempoPromedioGlobal = tiempoPromedioPorCanal.values().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

        // ========== GLOBAL ANTERIOR ==========
        int totalCreadosGlobalAnterior = totalCreadosAnteriorPorCanal.values().stream().mapToInt(Integer::intValue).sum();
        int totalResueltosGlobalAnterior = totalResueltosAnteriorPorCanal.values().stream().mapToInt(Integer::intValue).sum();
        double tiempoPromedioGlobalAnterior = tiemposAnterior.stream()
                .mapToDouble(KpiTiemposResolucion::getTiempoPromedioResolucionTotalMin)
                .average().orElse(0.0);

        int abiertosGlobal = Math.max(0, totalCreadosGlobal - totalResueltosGlobal);
        int abiertosGlobalAnterior = Math.max(0, totalCreadosGlobalAnterior - totalResueltosGlobalAnterior);

        // Calcular comparaciones GLOBAL
        resumenMap.put("GLOBAL", DashboardKpisDTO.KpisResumenDTO.builder()
                .ticketsAbiertos(crearKpiValor(abiertosGlobal, abiertosGlobalAnterior))
                .ticketsResueltos(crearKpiValor(totalResueltosGlobal, totalResueltosGlobalAnterior))
                .tiempoPromedio(crearKpiValorTiempo(tiempoPromedioGlobal, tiempoPromedioGlobalAnterior))
                .build());

        // ========== POR CANAL ==========
        java.util.Set<String> canales = new java.util.HashSet<>();
        canales.addAll(totalCreadosPorCanal.keySet());
        canales.addAll(totalResueltosPorCanal.keySet());
        canales.addAll(tiempoPromedioPorCanal.keySet());
        // Ensure expected channels exist
        canales.add("LLAMADA");
        canales.add("PRESENCIAL");

        for (String canal : canales) {
            int creados = totalCreadosPorCanal.getOrDefault(canal, 0);
            int resueltos = totalResueltosPorCanal.getOrDefault(canal, 0);
            int abiertos = Math.max(0, creados - resueltos);
            double tiempoMin = tiempoPromedioPorCanal.getOrDefault(canal, 0.0);

            int creadosAnt = totalCreadosAnteriorPorCanal.getOrDefault(canal, 0);
            int resueltosAnt = totalResueltosAnteriorPorCanal.getOrDefault(canal, 0);
            int abiertosAnt = Math.max(0, creadosAnt - resueltosAnt);
            double tiempoMinAnt = tiempoPromedioAnteriorPorCanal.getOrDefault(canal, 0.0);

            DashboardKpisDTO.KpisResumenDTO grupo = DashboardKpisDTO.KpisResumenDTO.builder()
                    .ticketsAbiertos(crearKpiValor(abiertos, abiertosAnt))
                    .ticketsResueltos(crearKpiValor(resueltos, resueltosAnt))
                    .tiempoPromedio(crearKpiValorTiempo(tiempoMin, tiempoMinAnt))
                    .build();

            resumenMap.put(canal, grupo);
        }

        this.reporte.setKpisResumen(resumenMap);
    }

    /**
     * Crea un KpiValorDTO con el valor actual y la comparación porcentual vs período anterior
     */
    private DashboardKpisDTO.KpiValorDTO crearKpiValor(int valorActual, int valorAnterior) {
        Integer diferencia = valorActual - valorAnterior;
        Integer porcentaje = null;
        
        if (valorAnterior > 0) {
            porcentaje = (int) Math.round(((double)(valorActual - valorAnterior) / valorAnterior) * 100.0);
        } else if (valorActual > 0) {
            porcentaje = 100; // Si antes era 0 y ahora hay, es +100%
        } else {
            porcentaje = 0;
        }
        
        return DashboardKpisDTO.KpiValorDTO.builder()
                .valor(valorActual)
                .comparativoPeriodo(diferencia)
                .comparativoPeriodoPct(porcentaje)
                .build();
    }

    /**
     * Crea un KpiValorDTO para tiempo (en formato string) con comparación
     */
    private DashboardKpisDTO.KpiValorDTO crearKpiValorTiempo(double tiempoMinActual, double tiempoMinAnterior) {
        Integer porcentaje = null;
        
        if (tiempoMinAnterior > 0) {
            porcentaje = (int) Math.round(((tiempoMinActual - tiempoMinAnterior) / tiempoMinAnterior) * 100.0);
        } else if (tiempoMinActual > 0) {
            porcentaje = 100;
        } else {
            porcentaje = 0;
        }
        
        return DashboardKpisDTO.KpiValorDTO.builder()
                .valor(String.format("%.1f hrs", tiempoMinActual / 60.0))
                .comparativoPeriodo(null) // Para tiempo no mostramos diferencia absoluta
                .comparativoPeriodoPct(porcentaje)
                .build();
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

        // Obtener todos los motivos de la BD para mapear ID -> Nombre
        Map<Long, String> motivosMap = motivoRepository.findAll().stream()
                .collect(Collectors.toMap(Motivo::getIdMotivo, Motivo::getNombre));

        List<DashboardKpisDTO.MotivoFrecuenteDTO> listaFinal = new ArrayList<>();
        
        agrupado.forEach((id, total) -> {
            String nombreMotivo = motivosMap.getOrDefault(id, "Motivo desconocido");
            listaFinal.add(DashboardKpisDTO.MotivoFrecuenteDTO.builder()
                    .motivo(nombreMotivo)
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
                        kpi -> kpi.getAgente().getIdEmpleado(),
                        Collectors.averagingDouble(KpiRendimientoAgenteDiario::getCsatPromedioAgente)
                ));

        // Sumar tickets por agente
        Map<Long, Integer> ticketsPorAgente = ranking.stream()
                .collect(Collectors.groupingBy(
                        kpi -> kpi.getAgente().getIdEmpleado(),
                        Collectors.summingInt(KpiRendimientoAgenteDiario::getTicketsResueltosTotal)
                ));

        // Obtener todos los agentes de la BD para mapear ID -> Nombre completo
        Map<Long, String> agentesMap = agenteRepository.findAll().stream()
                .collect(Collectors.toMap(
                        Agente::getIdEmpleado, 
                        a -> a.getNombre() + " " + a.getApellido()
                ));

        List<DashboardKpisDTO.AgenteRankingDTO> topAgentes = new ArrayList<>();
        
        csatPorAgente.forEach((id, csat) -> {
            Integer tickets = ticketsPorAgente.getOrDefault(id, 0);
            String nombreAgente = agentesMap.getOrDefault(id, "Agente " + id);
            topAgentes.add(DashboardKpisDTO.AgenteRankingDTO.builder()
                    .agenteId(id)
                    .nombre(nombreAgente)
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