package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Data;
import java.util.List;

@Data
public class RespuestaClienteDTO {
    private Long idEncuesta; // El ID de la encuesta que está respondiendo
    private List<ItemRespuesta> respuestas;

    @Data
    public static class ItemRespuesta {
        private Long idPregunta;
        private String valor; // Lo que contestó
    }
}