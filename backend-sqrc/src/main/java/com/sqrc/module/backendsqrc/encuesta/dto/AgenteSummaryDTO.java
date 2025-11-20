package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AgenteSummaryDTO {
    private String agenteId;
    private String nombre;
    private Integer ticketsActivos;
}