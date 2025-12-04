package com.sqrc.module.backendsqrc.reporte.model;

import com.sqrc.module.backendsqrc.ticket.model.Agente;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "kpi_rendimiento_agente_diario")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiRendimientoAgenteDiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    // Relación ManyToOne con la tabla agentes
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agente_id", nullable = false)
    private Agente agente;

    @Column(name = "tickets_resueltos_total")
    private Integer ticketsResueltosTotal;

    @Column(name = "tiempo_prom_res_total_min")
    private Integer tiempoPromedioResolucionMinutos;

    @Column(name = "csat_promedio_agente")
    private Double csatPromedioAgente; // Ej: 4.5
}