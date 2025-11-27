package com.sqrc.module.backendsqrc.reporte.model;

import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "kpi_tiempos_resolucion")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiTiemposResolucion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    private TipoCaso tipoCaso;

    private String canal;

    @Column(name = "tiempo_prom_prim_respuesta")
    private Integer tiempoPromedioPrimeraRespuestaMin;

    @Column(name = "tiempo_prom_res_total_min")
    private Integer tiempoPromedioResolucionTotalMin;
}