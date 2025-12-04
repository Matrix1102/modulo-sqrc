package com.sqrc.module.backendsqrc.ticket.dto.request;

import com.sqrc.module.backendsqrc.ticket.model.EstadoTicket;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitar el cambio de estado de un ticket.
 * 
 * Patrón: DTO + Se usará con Strategy Pattern para validar transiciones.
 * 
 * Transiciones válidas:
 * - ABIERTO -> ESCALADO (Agente escala a BackOffice)
 * - ABIERTO -> CERRADO (Agente resuelve directamente)
 * - ESCALADO -> DERIVADO (BackOffice deriva a área especializada)
 * - ESCALADO -> ABIERTO (BackOffice rechaza y devuelve a Agente)
 * - ESCALADO -> CERRADO (BackOffice resuelve)
 * - DERIVADO -> CERRADO (Área especializada resuelve)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CambiarEstadoRequest {

    @NotNull(message = "El nuevo estado es obligatorio")
    private EstadoTicket nuevoEstado;

    /**
     * Motivo del cambio de estado (obligatorio para ciertas transiciones)
     */
    private String motivo;

    /**
     * ID del empleado que realiza el cambio
     */
    @NotNull(message = "El ID del empleado es obligatorio")
    private Long empleadoId;
}
