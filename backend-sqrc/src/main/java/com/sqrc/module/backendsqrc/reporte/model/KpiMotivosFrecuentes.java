package com.sqrc.module.backendsqrc.reporte.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "kpi_motivos_frecuentes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiMotivosFrecuentes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    // Solo el ID del motivo (o el nombre en texto si prefieres congelarlo)
    @Column(name = "id_motivo")
    private Long idMotivo; 
    
    // Opcional: Guardar el nombre del motivo aquí por si lo borran de la tabla maestra
    // private String nombreMotivoSnapshot; 

    @Column(name = "conteo_total")
    private Integer conteoTotal;
}