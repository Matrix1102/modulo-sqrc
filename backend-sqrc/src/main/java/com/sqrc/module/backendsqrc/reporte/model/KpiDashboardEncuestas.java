package com.sqrc.module.backendsqrc.reporte.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "kpi_dashboard_encuestas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiDashboardEncuestas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "csat_promedio_agente_global")
    private Double csatPromedioAgenteGlobal;

    @Column(name = "csat_promedio_servicio_global")
    private Double csatPromedioServicioGlobal;

    @Column(name = "total_respuestas_global")
    private Integer totalRespuestasGlobal;

    @Column(name = "tasa_respuesta_global")
    private Double tasaRespuestaGlobal; // Porcentaje (Ej: 0.15 para 15%)
}