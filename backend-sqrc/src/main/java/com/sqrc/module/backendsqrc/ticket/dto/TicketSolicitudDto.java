package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO específico para tickets de tipo SOLICITUD
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketSolicitudDto {
    
    private String tipoSolicitud;
}
