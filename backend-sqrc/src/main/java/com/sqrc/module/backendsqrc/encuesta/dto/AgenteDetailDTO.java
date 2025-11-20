package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AgenteDetailDTO {
    private String agenteId;
    private String nombre;
    private Integer volumenTotalAtendido;
    private String tiempoPromedioResolucion;
    private String tiempoPromedioPrimeraRespuesta;
    private Double cumplimientoSlaPct;
    private Double csatPromedio;
}