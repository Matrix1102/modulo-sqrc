package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para registrar feedback de un artículo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackRequest {

    @NotNull(message = "El ID de la versión es obligatorio")
    private Integer idVersion;

    @NotNull(message = "El ID del empleado es obligatorio")
    private Long idEmpleado;

    @Size(max = 500, message = "El comentario no puede exceder 500 caracteres")
    private String comentario;

    @Min(value = 1, message = "La calificación mínima es 1")
    @Max(value = 5, message = "La calificación máxima es 5")
    private Integer calificacion;

    @NotNull(message = "Debe indicar si fue útil o no")
    private Boolean util;
}
