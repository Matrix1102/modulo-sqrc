package com.sqrc.module.backendsqrc.reporte.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketReporteDTO {
    private String id;
    private String client;
    private String motive;
    private String date; // formatted
    private String status;
}
