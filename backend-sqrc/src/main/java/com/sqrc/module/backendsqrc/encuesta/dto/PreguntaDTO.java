package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PreguntaDTO {
    private Integer orden;
    private String texto;
    private String tipo; // "RADIO", "BOOLEAN", "TEXTO"
    private boolean obligatoria;
    private List<String> opciones; // Opcional, para tipo RADIO
}