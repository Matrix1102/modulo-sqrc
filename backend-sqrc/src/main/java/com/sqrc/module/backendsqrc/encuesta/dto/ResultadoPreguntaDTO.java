package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResultadoPreguntaDTO {
    private String pregunta;
    private Object respuesta; // Puede ser String ("Sí") o Integer (4)
}