package com.sqrc.module.backendsqrc.reporte.model;

import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso; // Tu Enum existente
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "kpi_resumen_diario")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiResumenDiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha; // El día del reporte

    @Enumerated(EnumType.STRING)
    private TipoCaso tipoCaso; // RECLAMO, SOLICITUD...

    @Column(length = 50)
    private String canal; // "Telefonico", "Presencial", etc.

    @Column(name = "total_casos_creados")
    private Integer totalCasosCreados;

    @Column(name = "total_casos_resueltos")
    private Integer totalCasosResueltos;
}