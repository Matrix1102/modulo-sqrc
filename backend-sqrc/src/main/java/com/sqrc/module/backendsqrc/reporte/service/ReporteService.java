package com.sqrc.module.backendsqrc.reporte.service;

import com.sqrc.module.backendsqrc.reporte.dto.*;
import com.sqrc.module.backendsqrc.encuesta.repository.RespuestaEncuestaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReporteService {

    @Autowired
    private RespuestaEncuestaRepository respuestaRepository;

    // ==========================================
    // 1. Lógica del Dashboard (Cálculos)
    // ==========================================
    
    public DashboardKpisDTO generarDashboard(LocalDate start, LocalDate end) {
        // Lógica de cálculo (count, avg) usando respuestaRepository...
        // Simulamos datos para que el Frontend tenga algo que mostrar
        
        return DashboardKpisDTO.builder()
                .kpisGlobales(DashboardKpisDTO.KpisGlobalesDTO.builder()
                        .totalCasos(150)
                        .desgloseTipo(List.of(
                                DashboardKpisDTO.DesgloseTipoDTO.builder().tipo("Reclamo").cantidad(50).build(),
                                DashboardKpisDTO.DesgloseTipoDTO.builder().tipo("Consulta").cantidad(100).build()
                        ))
                        .build())
                .kpisResumen(DashboardKpisDTO.KpisResumenDTO.builder()
                        .tiempoPromedio(DashboardKpisDTO.KpiValorDTO.builder().valor("2.5h").comparativoPeriodo("+5%").build())
                        .build())
                .build();
    }

    // ==========================================
    // 2. Lógica de Ranking de Agentes
    // ==========================================

    public List<AgenteDetailDTO> obtenerMetricasAgentes(LocalDate start, LocalDate end) {
        // Simulación de ranking
        List<AgenteDetailDTO> ranking = new ArrayList<>();
        ranking.add(AgenteDetailDTO.builder()
                .nombre("Juan Pérez")
                .volumenTotalAtendido(45)
                .csatPromedio(4.8)
                .build());
        ranking.add(AgenteDetailDTO.builder()
                .nombre("Maria Lopez")
                .volumenTotalAtendido(30)
                .csatPromedio(4.9)
                .build());
        return ranking;
    }

    // ¡ADIÓS al método exportarReporte! Ya no lo necesitas.
}