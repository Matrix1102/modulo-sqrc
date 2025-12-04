package com.sqrc.module.backendsqrc.reporte.service;

import com.sqrc.module.backendsqrc.reporte.dto.AgentTicketsDTO;
import com.sqrc.module.backendsqrc.reporte.dto.TicketReporteDTO;
import com.sqrc.module.backendsqrc.ticket.model.Agente;
import com.sqrc.module.backendsqrc.ticket.model.Asignacion;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.repository.AgenteRepository;
import com.sqrc.module.backendsqrc.ticket.repository.AsignacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteTicketServiceImpl implements ReporteTicketService {

    private final AsignacionRepository asignacionRepository;
    private final AgenteRepository agenteRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    @Transactional(readOnly = true)
    public AgentTicketsDTO obtenerTicketsPorAgente(String agenteId, LocalDate startDate, LocalDate endDate) {
        Long idAgente;
        try {
            idAgente = Long.parseLong(agenteId);
        } catch (NumberFormatException e) {
            log.warn("ID de agente inválido: {}", agenteId);
            return AgentTicketsDTO.builder()
                    .agenteId(agenteId)
                    .agenteNombre("Agente desconocido")
                    .tickets(Collections.emptyList())
                    .build();
        }

        // Obtener el nombre del agente
        String nombreAgente = agenteRepository.findById(idAgente)
                .map(Agente::getNombreCompleto)
                .orElse("Agente " + agenteId);

        // Obtener asignaciones del agente con sus tickets
        List<Asignacion> asignaciones = asignacionRepository.findByEmpleadoIdWithTicket(idAgente);

        // Filtrar por fechas si se proporcionan
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;

        List<TicketReporteDTO> ticketDTOs = asignaciones.stream()
                .map(Asignacion::getTicket)
                .filter(ticket -> {
                    if (startDateTime != null && ticket.getFechaCreacion().isBefore(startDateTime)) {
                        return false;
                    }
                    if (endDateTime != null && ticket.getFechaCreacion().isAfter(endDateTime)) {
                        return false;
                    }
                    return true;
                })
                .sorted(Comparator.comparing(Ticket::getFechaCreacion).reversed())
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return AgentTicketsDTO.builder()
                .agenteId(agenteId)
                .agenteNombre(nombreAgente)
                .tickets(ticketDTOs)
                .build();
    }

    private TicketReporteDTO mapToDTO(Ticket ticket) {
        String clientName = ticket.getCliente() != null
                ? ticket.getCliente().getNombres() + " " + ticket.getCliente().getApellidos()
                : "Cliente desconocido";

        String motivo = ticket.getMotivo() != null
                ? ticket.getMotivo().getNombre()
                : "Sin motivo";

        String fecha = ticket.getFechaCreacion() != null
                ? ticket.getFechaCreacion().format(DATE_FORMATTER)
                : "-";

        String estado = ticket.getEstado() != null
                ? ticket.getEstado().name()
                : "DESCONOCIDO";

        return TicketReporteDTO.builder()
                .id(ticket.getIdTicket().toString())
                .client(clientName)
                .motive(motivo)
                .date(fecha)
                .status(estado)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketReporteDTO> obtenerTicketsRecientes(LocalDate startDate, LocalDate endDate, Integer limit) {
        // Valores por defecto: últimos 30 días, máximo 50 tickets
        LocalDateTime inicio = (startDate != null ? startDate : LocalDate.now().minusDays(30)).atStartOfDay();
        LocalDateTime fin = (endDate != null ? endDate : LocalDate.now()).atTime(23, 59, 59);
        int maxItems = limit != null ? limit : 50;

        List<Asignacion> asignaciones = asignacionRepository.findRecentWithDetails(inicio, fin);

        // Evitar duplicados de tickets (un ticket puede tener múltiples asignaciones)
        return asignaciones.stream()
                .map(Asignacion::getTicket)
                .distinct()
                .sorted(Comparator.comparing(Ticket::getFechaCreacion).reversed())
                .limit(maxItems)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
}
