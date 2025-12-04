package com.sqrc.module.backendsqrc.reporte.service;

import com.sqrc.module.backendsqrc.reporte.dto.AgentTicketsDTO;
import com.sqrc.module.backendsqrc.reporte.dto.TicketReporteDTO;

import java.time.LocalDate;
import java.util.List;

public interface ReporteTicketService {
    AgentTicketsDTO obtenerTicketsPorAgente(String agenteId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Obtiene los tickets más recientes de todos los agentes
     */
    List<TicketReporteDTO> obtenerTicketsRecientes(LocalDate startDate, LocalDate endDate, Integer limit);
}
