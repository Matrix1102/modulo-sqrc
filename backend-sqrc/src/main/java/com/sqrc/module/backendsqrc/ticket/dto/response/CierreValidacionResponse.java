package com.sqrc.module.backendsqrc.ticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO con la información de validación para cerrar un ticket.
 * Indica si el ticket puede ser cerrado y el estado de los requisitos.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CierreValidacionResponse {

    /**
     * Indica si el ticket puede ser cerrado (todos los requisitos cumplidos).
     */
    private boolean puedeCerrar;

    /**
     * Indica si existe al menos una respuesta enviada al cliente.
     */
    private boolean tieneRespuestaEnviada;

    /**
     * Indica si existe documentación para la asignación actual.
     */
    private boolean tieneDocumentacion;

    /**
     * Estado actual del ticket.
     */
    private String estadoTicket;

    /**
     * Mensaje descriptivo del estado de cierre.
     */
    private String mensaje;
}
