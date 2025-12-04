package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/**
 * DTO para enviar los datos de una encuesta al cliente para que la responda.
 */
@Data
@Builder
public class EncuestaEjecucionDTO {
    private Long idEncuesta;
    private String plantillaNombre;
    private String plantillaDescripcion;
    private String estado;
    private String alcanceEvaluacion;
    private String agenteNombre;
    private String clienteNombre;
    private List<PreguntaEjecucionDTO> preguntas;

    @Data
    @Builder
    public static class PreguntaEjecucionDTO {
        private Long idPregunta;
        private String texto;
        private String tipo;
        private Boolean obligatoria;
        private Integer orden;
        private Boolean esCalificacion;
        private List<OpcionDTO> opciones;
    }

    @Data
    @Builder
    public static class OpcionDTO {
        private Long idOpcion;
        private String texto;
        private Integer orden;
        private Integer valor; // Valor numérico para cálculos (= orden por defecto)
    }
}
