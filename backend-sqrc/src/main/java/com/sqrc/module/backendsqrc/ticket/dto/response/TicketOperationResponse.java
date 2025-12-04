package com.sqrc.module.backendsqrc.ticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta genérica para operaciones sobre tickets.
 * 
 * Patrón: DTO (Data Transfer Object)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketOperationResponse {

    private Long ticketId;
    private String estadoAnterior;
    private String estadoActual;
    private String operacion;
    private LocalDateTime fechaOperacion;
    private String mensaje;
    private boolean exitoso;
}
