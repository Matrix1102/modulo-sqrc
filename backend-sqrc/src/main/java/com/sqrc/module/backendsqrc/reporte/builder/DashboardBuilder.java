package com.sqrc.module.backendsqrc.reporte.builder;

import com.sqrc.module.backendsqrc.reporte.dto.DashboardKpisDTO;
import com.sqrc.module.backendsqrc.encuesta.model.RespuestaEncuesta;
import java.util.List;

public interface DashboardBuilder {
    void reset();

    void calcularKpisGlobales(List<RespuestaEncuesta> datos);

    void generarResumenOperativo(List<RespuestaEncuesta> datos);

    void analizarMotivosFrecuentes(List<RespuestaEncuesta> datos);

    void generarRankingAgentes(List<RespuestaEncuesta> datos);

    DashboardKpisDTO getResultado();
}