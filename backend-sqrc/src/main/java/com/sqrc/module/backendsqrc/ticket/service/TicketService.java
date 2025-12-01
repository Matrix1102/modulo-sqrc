package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.dto.AssignmentHistoryDTO;
import com.sqrc.module.backendsqrc.ticket.dto.TicketDetailDTO;
import com.sqrc.module.backendsqrc.ticket.dto.TicketFilterDTO;
import com.sqrc.module.backendsqrc.ticket.dto.TicketSummaryDTO;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.ticket.repository.DocumentacionRepository;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar tickets del cliente en Vista 360
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final DocumentacionRepository documentacionRepository;

    /**
     * Busca tickets aplicando filtros
     */
    @Transactional(readOnly = true)
    public List<TicketSummaryDTO> searchTickets(TicketFilterDTO filter) {
        log.debug("Buscando tickets con filtros: {}", filter);

        Specification<Ticket> spec = createSpecification(filter);
        List<Ticket> tickets = ticketRepository.findAll(spec);

        return tickets.stream()
                .map(this::mapToSummary)
                .sorted(Comparator.comparing(TicketSummaryDTO::getRelevantDate).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Obtiene el detalle completo de un ticket por ID
     */
    @Transactional(readOnly = true)
    public TicketDetailDTO getTicketById(Long ticketId) {
        log.debug("Obteniendo detalle del ticket ID: {}", ticketId);

        Ticket ticket = ticketRepository.findByIdWithDetails(ticketId);
        if (ticket == null) {
            throw new RuntimeException("Ticket no encontrado: " + ticketId);
        }

        return mapToDetail(ticket);
    }

    /**
     * Obtiene tickets de un cliente específico
     */
    @Transactional(readOnly = true)
    public List<TicketSummaryDTO> getTicketsByClienteId(Integer clienteId) {
        log.debug("Obteniendo tickets del cliente ID: {}", clienteId);

        List<Ticket> tickets = ticketRepository.findByClienteIdWithDetails(clienteId);

        return tickets.stream()
                .map(this::mapToSummary)
                .sorted(Comparator.comparing(TicketSummaryDTO::getRelevantDate).reversed())
                .collect(Collectors.toList());
    }

    // ==================== Métodos Privados ====================

    /**
     * Crea Specification dinámico para filtros
     */
    private Specification<Ticket> createSpecification(TicketFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filtro por cliente
            if (filter.getClienteId() != null) {
                predicates.add(cb.equal(root.get("cliente").get("idCliente"), filter.getClienteId()));
            }

            // Filtro por término de búsqueda (busca en asunto, descripción, motivo)
            if (filter.getTerm() != null && !filter.getTerm().isBlank()) {
                String searchTerm = "%" + filter.getTerm().toLowerCase() + "%";
                Predicate asunto = cb.like(cb.lower(root.get("asunto")), searchTerm);
                Predicate descripcion = cb.like(cb.lower(root.get("descripcion")), searchTerm);
                Predicate motivo = cb.like(cb.lower(root.get("motivo").get("nombre")), searchTerm);
                predicates.add(cb.or(asunto, descripcion, motivo));
            }

            // Filtro por estados
            if (filter.getStatus() != null && filter.getStatus().length > 0) {
                List<EstadoTicket> estados = new ArrayList<>();
                for (String status : filter.getStatus()) {
                    try {
                        estados.add(EstadoTicket.valueOf(status.toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        log.warn("Estado inválido ignorado: {}", status);
                    }
                }
                if (!estados.isEmpty()) {
                    predicates.add(root.get("estado").in(estados));
                }
            }

            // Filtro por tipo de ticket
            if (filter.getType() != null && !filter.getType().isBlank()) {
                try {
                    TipoTicket tipo = TipoTicket.valueOf(filter.getType().toUpperCase());
                    predicates.add(cb.equal(root.get("tipoTicket"), tipo));
                } catch (IllegalArgumentException e) {
                    log.warn("Tipo de ticket inválido ignorado: {}", filter.getType());
                }
            }

            // Filtro por canal/origen
            if (filter.getChannel() != null && !filter.getChannel().isBlank()) {
                try {
                    OrigenTicket origen = OrigenTicket.valueOf(filter.getChannel().toUpperCase());
                    predicates.add(cb.equal(root.get("origen"), origen));
                } catch (IllegalArgumentException e) {
                    log.warn("Canal inválido ignorado: {}", filter.getChannel());
                }
            }

            // Filtro por rango de fechas (usa la fecha más relevante)
            if (filter.getDateStart() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fechaCreacion"), filter.getDateStart()));
            }
            if (filter.getDateEnd() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("fechaCreacion"), filter.getDateEnd()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Mapea Ticket a TicketSummaryDTO
     */
    private TicketSummaryDTO mapToSummary(Ticket ticket) {
        return TicketSummaryDTO.builder()
                .id(ticket.getIdTicket())
                .reasonTitle(ticket.getMotivo() != null ? ticket.getMotivo().getNombre() : "Sin motivo")
                .status(ticket.getEstado().name())
                .relevantDate(getRelevantDate(ticket))
                .priority(calculatePriority(ticket))
                .build();
    }

    /**
     * Mapea Ticket a TicketDetailDTO
     */
    private TicketDetailDTO mapToDetail(Ticket ticket) {
        // Buscar KB article en documentación
        List<Documentacion> docs = documentacionRepository.findByTicketId(ticket.getIdTicket());
        String kbArticleId = docs.isEmpty() || docs.get(0).getIdArticuloKB() == null
                ? null
                : "KB-" + docs.get(0).getIdArticuloKB();

        // Obtener último agente asignado
        String lastAgentName = ticket.getAsignaciones().stream()
                .max(Comparator.comparing(Asignacion::getFechaInicio))
                .map(a -> a.getEmpleado() != null ? a.getEmpleado().getNombre() : "Sin asignar")
                .orElse("Sin asignar");

        // Fecha de primera atención (primera asignación)
        LocalDateTime attentionDate = ticket.getAsignaciones().stream()
                .min(Comparator.comparing(Asignacion::getFechaInicio))
                .map(Asignacion::getFechaInicio)
                .orElse(null);

        // Mapear historial de asignaciones
        List<AssignmentHistoryDTO> history = ticket.getAsignaciones().stream()
                .sorted(Comparator.comparing(Asignacion::getFechaInicio))
                .map(this::mapAssignment)
                .collect(Collectors.toList());

        return TicketDetailDTO.builder()
                .id(ticket.getIdTicket())
                .reasonTitle(ticket.getMotivo() != null ? ticket.getMotivo().getNombre() : "Sin motivo")
                .status(ticket.getEstado().name())
                .priority(calculatePriority(ticket))
                .description(ticket.getDescripcion())
                .type(ticket.getTipoTicket() != null ? ticket.getTipoTicket().name() : "DESCONOCIDO")
                .channel(ticket.getOrigen() != null ? ticket.getOrigen().getDisplayName() : "Desconocido")
                .creationDate(ticket.getFechaCreacion())
                .attentionDate(attentionDate)
                .closingDate(ticket.getFechaCierre())
                .kbArticleId(kbArticleId)
                .lastAgentName(lastAgentName)
                .assignmentHistory(history)
                .build();
    }

    /**
     * Mapea Asignacion a AssignmentHistoryDTO
     */
    private AssignmentHistoryDTO mapAssignment(Asignacion asignacion) {
        String agentName = asignacion.getEmpleado() != null
                ? asignacion.getEmpleado().getNombre()
                : "Sin asignar";

        String area = asignacion.getAreaId() != null
                ? "Área ID: " + asignacion.getAreaId()
                : "Sin área";

        String stepStatus = asignacion.getFechaFin() == null ? "En proceso" : "Finalizado";

        return AssignmentHistoryDTO.builder()
                .agentName(agentName)
                .area(area)
                .startDate(asignacion.getFechaInicio())
                .endDate(asignacion.getFechaFin())
                .stepStatus(stepStatus)
                .notes("") // Puedes agregar un campo 'notas' en Asignacion si lo necesitas
                .build();
    }

    /**
     * Obtiene la fecha más relevante del ticket (cierre > primera atención > creación)
     */
    private LocalDateTime getRelevantDate(Ticket ticket) {
        if (ticket.getFechaCierre() != null) {
            return ticket.getFechaCierre();
        }

        LocalDateTime attentionDate = ticket.getAsignaciones().stream()
                .min(Comparator.comparing(Asignacion::getFechaInicio))
                .map(Asignacion::getFechaInicio)
                .orElse(null);

        return attentionDate != null ? attentionDate : ticket.getFechaCreacion();
    }

    /**
     * Calcula la prioridad del ticket basado en reglas de negocio
     * TODO: Implementar lógica real de prioridad
     */
    private String calculatePriority(Ticket ticket) {
        // Lógica simple por ahora: RECLAMO = Alta, QUEJA = Media, resto = Baja
        if (ticket.getTipoTicket() == TipoTicket.RECLAMO) {
            return "Alta";
        } else if (ticket.getTipoTicket() == TipoTicket.QUEJA) {
            return "Media";
        }
        return "Baja";
    }
}
