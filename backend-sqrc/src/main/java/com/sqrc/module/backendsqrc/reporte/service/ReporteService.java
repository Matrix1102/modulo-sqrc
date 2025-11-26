package com.sqrc.module.backendsqrc.reporte.service;

import com.sqrc.module.backendsqrc.encuesta.model.RespuestaEncuesta;
import com.sqrc.module.backendsqrc.encuesta.repository.RespuestaEncuestaRepository;
import com.sqrc.module.backendsqrc.reporte.builder.DashboardBuilder;
import com.sqrc.module.backendsqrc.reporte.dto.*;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReporteService {

    @Autowired
    private RespuestaEncuestaRepository respuestaRepository;

    // PATRÓN BUILDER: Inyectamos una fábrica para obtener nuevas instancias del Builder (Prototype)
    // Esto es necesario porque el Builder tiene estado (los datos que va acumulando)
    @Autowired
    private ObjectFactory<DashboardBuilder> dashboardBuilderFactory;

    // ==========================================
    // 1. LÓGICA DEL DASHBOARD (Usando Builder)
    // ==========================================
    
    public DashboardKpisDTO generarDashboard(LocalDate start, LocalDate end) {
        // 1. Obtener Datos Crudos
        // En una V2 aquí usaríamos Specification también para filtrar por fecha antes de traer los datos
        List<RespuestaEncuesta> dataRaw = respuestaRepository.findAll(); 

        // 2. Obtener una instancia fresca del Builder
        DashboardBuilder builder = dashboardBuilderFactory.getObject();

        // 3. Construir el reporte paso a paso (El Servicio actúa como "Director")
        builder.reset();
        builder.calcularKpisGlobales(dataRaw);
        builder.generarResumenOperativo(dataRaw);
        builder.analizarMotivosFrecuentes(dataRaw);
        builder.generarRankingAgentes(dataRaw);

        // 4. Retornar el producto final
        return builder.getResultado();
    }

    // ==========================================
    // 2. LÓGICA DE RANKING DE AGENTES (Tabla Detallada)
    // ==========================================

    public List<AgenteDetailDTO> obtenerMetricasAgentes(LocalDate start, LocalDate end) {
        // Esta lógica también podría moverse a un Builder si se vuelve compleja.
        // Por ahora, usamos datos simulados para que el Frontend tenga qué mostrar.
        List<AgenteDetailDTO> ranking = new ArrayList<>();
        
        ranking.add(AgenteDetailDTO.builder()
                .nombre("Juan Pérez")
                .volumenTotalAtendido(45)
                .csatPromedio(4.8)
                .tiempoPromedioResolucion("2.1h")
                .build());
                
        ranking.add(AgenteDetailDTO.builder()
                .nombre("Maria Lopez")
                .volumenTotalAtendido(30)
                .csatPromedio(4.9)
                .tiempoPromedioResolucion("1.8h")
                .build());
                
        return ranking;
    }
}