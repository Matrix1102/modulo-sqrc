package com.sqrc.module.backendsqrc.encuesta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PreguntaDTO {
    private Integer orden;

    @NotBlank(message = "El texto de la pregunta es obligatorio")
    private String texto;

    @NotBlank(message = "El tipo de pregunta es obligatorio")
    private String tipo; // "RADIO", "BOOLEANA", "TEXTO"

    private boolean obligatoria;

    /**
     * Indica si esta pregunta es la de calificación general (1-5).
     * Solo puede haber una por plantilla.
     */
    private boolean esCalificacion;

    @Size(min = 1, message = "Las preguntas de tipo RADIO deben incluir al menos una opción")
    private List<String> opciones; // Opcional, para tipo RADIO
}