package com.sqrc.module.backendsqrc.ticket.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para asociar una llamada a un ticket.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsociarLlamadaRequest {

    @NotNull(message = "El ID de la llamada es obligatorio")
    private Long llamadaId;

    @NotNull(message = "El ID del ticket es obligatorio")
    private Long ticketId;
}
