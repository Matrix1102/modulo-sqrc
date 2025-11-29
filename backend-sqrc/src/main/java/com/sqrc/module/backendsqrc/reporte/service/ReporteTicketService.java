package com.sqrc.module.backendsqrc.reporte.service;

import com.sqrc.module.backendsqrc.reporte.dto.AgentTicketsDTO;
import java.time.LocalDate;

public interface ReporteTicketService {
    AgentTicketsDTO obtenerTicketsPorAgente(String agenteId, LocalDate startDate, LocalDate endDate);
}
