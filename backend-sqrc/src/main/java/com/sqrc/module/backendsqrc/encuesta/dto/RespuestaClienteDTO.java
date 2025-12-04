package com.sqrc.module.backendsqrc.encuesta.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class RespuestaClienteDTO {
    @NotNull(message = "El idEncuesta es obligatorio")
    private Long idEncuesta; // El ID de la encuesta que está respondiendo

    @Valid
    @NotEmpty(message = "La lista de respuestas no puede estar vacía")
    private List<ItemRespuesta> respuestas;

    /**
     * Calificación general (1-5). Opcional si la encuesta tiene una pregunta de calificación.
     * Si se proporciona, se usa como fallback en caso de que no se pueda extraer de las respuestas.
     */
    @jakarta.validation.constraints.Min(value = 1, message = "La calificación mínima es 1")
    @jakarta.validation.constraints.Max(value = 5, message = "La calificación máxima es 5")
    private Integer calificacion;

    @Data
    public static class ItemRespuesta {
        @NotNull(message = "El idPregunta es obligatorio")
        private Long idPregunta;

        @NotBlank(message = "El valor de la respuesta no puede estar vacío")
        private String valor; // Lo que contestó
    }
}