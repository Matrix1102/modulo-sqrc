package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResultadoPreguntaDTO {
    private String question;
    private String answer;
    private String type; // RATING, BOOLEAN, TEXT
}