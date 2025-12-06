package com.sqrc.module.backendsqrc.reporte.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketReporteDTO {
    // `id` remains for compatibility and will contain the Ticket ID as string
    private String id;
    // explicit fields for clarity/debugging
    private Long ticketId;
    private Long asignacionId;
    private String client;
    private String motive;
    private String date; // formatted
    private String status;
}
