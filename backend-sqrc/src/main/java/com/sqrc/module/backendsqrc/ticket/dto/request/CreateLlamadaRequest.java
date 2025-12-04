package com.sqrc.module.backendsqrc.ticket.dto.request;

import com.sqrc.module.backendsqrc.ticket.model.EstadoLlamada;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear una nueva llamada.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLlamadaRequest {

    private String numeroOrigen;

    @NotNull(message = "El ID del empleado es obligatorio")
    private Long empleadoId;

    private EstadoLlamada estado;
}
