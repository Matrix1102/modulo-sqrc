package com.sqrc.module.backendsqrc.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RespuestaDerivacionDTO {

    @NotBlank(message = "Debes ingresar la respuesta recibida del área externa")
    private String respuestaExterna; // Ej: "El cobro fue anulado con nota de crédito #555"

    @NotNull(message = "Indica si el caso quedó resuelto")
    private Boolean solucionado; // true = Cierra el ticket, false = Vuelve al Backoffice para seguir peleando

    private String observacionesAdicionales; // Opcional
}