package com.sqrc.module.backendsqrc.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO para registrar la respuesta recibida de un área externa.
 * La respuesta se guarda directamente en la tabla notificaciones_externas.
 */
@Data
public class RespuestaDerivacionDTO {

    @NotBlank(message = "Debes ingresar la respuesta recibida del área externa")
    private String respuestaExterna;

    @NotNull(message = "Indica si el caso quedó resuelto")
    private Boolean solucionado;
}