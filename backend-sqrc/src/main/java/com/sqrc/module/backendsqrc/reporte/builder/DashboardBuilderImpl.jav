package com.sqrc.module.backendsqrc.reporte.builder;

import com.sqrc.module.backendsqrc.reporte.dto.DashboardKpisDTO;
import com.sqrc.module.backendsqrc.encuesta.model.RespuestaEncuesta;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Scope("prototype") // CRÍTICO: Crea una instancia nueva por cada petición HTTP
public class DashboardBuilderImpl implements DashboardBuilder {

    private DashboardKpisDTO reporte;

    @Override
    public void reset() {
        this.reporte = DashboardKpisDTO.builder().build();
    }

    @Override
    public void calcularKpisGlobales(List<RespuestaEncuesta> datos) {
        // Lógica real: contar y agrupar
        int total = datos.size();
        // Aquí iría tu lógica de Stream para contar por tipo
        this.reporte.setKpisGlobales(DashboardKpisDTO.KpisGlobalesDTO.builder()
                .totalCasos(total)
                .desgloseTipo(new ArrayList<>()) // Rellenar con datos reales
                .build());
    }

    @Override
    public void generarResumenOperativo(List<RespuestaEncuesta> datos) {
        // Simulamos cálculos complejos de SLA
        this.reporte.setKpisResumen(DashboardKpisDTO.KpisResumenDTO.builder()
                .tiempoPromedio(DashboardKpisDTO.KpiValorDTO.builder().valor("2.5h").build())
                .build());
    }

    @Override
    public void analizarMotivosFrecuentes(List<RespuestaEncuesta> datos) {
        this.reporte.setMotivosFrecuentes(new ArrayList<>());
    }

    @Override
    public void generarRankingAgentes(List<RespuestaEncuesta> datos) {
        this.reporte.setAgentesMejorEvaluados(new ArrayList<>());
    }

    @Override
    public DashboardKpisDTO getResultado() {
        return this.reporte;
    }
}