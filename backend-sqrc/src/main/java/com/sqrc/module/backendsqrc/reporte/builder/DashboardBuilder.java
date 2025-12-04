package com.sqrc.module.backendsqrc.reporte.builder;

import com.sqrc.module.backendsqrc.reporte.dto.DashboardKpisDTO;
import com.sqrc.module.backendsqrc.reporte.model.*; // Tus nuevas entidades
import java.util.List;

public interface DashboardBuilder {
    void reset();

    // Ahora recibe el resumen diario, no las encuestas crudas
    void construirKpisGlobales(List<KpiResumenDiario> resumenes);

    // Recibe los tiempos pre-calculados + datos del período anterior para comparación
    void construirResumenOperativo(List<KpiResumenDiario> resumenes, List<KpiTiemposResolucion> tiempos,
                                   List<KpiResumenDiario> resumenesAnterior, List<KpiTiemposResolucion> tiemposAnterior);

    // Recibe el top de motivos
    void construirMotivosFrecuentes(List<KpiMotivosFrecuentes> motivos);

    // Recibe el ranking de agentes
    void construirRankingAgentes(List<KpiRendimientoAgenteDiario> ranking);

    DashboardKpisDTO getResultado();
}