package com.sqrc.module.backendsqrc.reporte.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AgentTicketsDTO {
    private String agenteId;
    private String agenteNombre;
    private List<TicketReporteDTO> tickets;
}

