package com.sqrc.module.backendsqrc.reporte.service;

import com.sqrc.module.backendsqrc.reporte.dto.AgentTicketsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteTicketServiceImpl implements ReporteTicketService {

    @Override
    public AgentTicketsDTO obtenerTicketsPorAgente(String agenteId, LocalDate startDate, LocalDate endDate) {
        // Por ahora scaffold: la relación agente->ticket aún no está implementada en las entidades.
        log.warn("ReporteTicketService: petición para agente {} pero la consulta real no está implementada. Devolviendo lista vacía.", agenteId);

        AgentTicketsDTO resp = AgentTicketsDTO.builder()
                .agenteId(agenteId)
                .agenteNombre("Agente " + agenteId)
                .tickets(Collections.emptyList())
                .build();

        return resp;
    }
}
