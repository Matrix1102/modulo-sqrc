package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SurveyDashboardDTO {
    private Double csatPromedioAgente;
    private Double csatPromedioServicio;
    private Integer totalRespuestas;
    private Double tasaRespuestaPct;
}