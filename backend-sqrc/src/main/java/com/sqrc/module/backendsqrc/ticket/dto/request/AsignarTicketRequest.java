package com.sqrc.module.backendsqrc.ticket.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para asignar o reasignar un ticket a un empleado.
 * 
 * Patrón: DTO (Data Transfer Object)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignarTicketRequest {

    /**
     * ID del empleado al que se asigna el ticket
     */
    @NotNull(message = "El ID del empleado es obligatorio")
    private Long empleadoId;

    /**
     * ID del área (opcional)
     */
    private Long areaId;

    /**
     * Motivo de la asignación o reasignación
     */
    private String motivo;
}
