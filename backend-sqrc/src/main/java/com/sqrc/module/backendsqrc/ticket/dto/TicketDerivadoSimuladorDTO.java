package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para el simulador de área externa.
 * Contiene información del ticket derivado y su notificación más reciente.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketDerivadoSimuladorDTO {

    private Long idTicket;
    private String asunto;
    private String descripcion;
    private NotificacionExternaDTO notificacion;
}

