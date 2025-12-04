package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.dto.*;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.ticket.repository.*;
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
import java.util.Optional;
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
    private final ConsultaRepository consultaRepository;
    private final QuejaRepository quejaRepository;
    private final SolicitudRepository solicitudRepository;
    private final ReclamoRepository reclamoRepository;

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
        // Buscar KB article en documentación (por ahora no hay relación con KB en Documentacion)
        String kbArticleId = null; // TODO: Agregar relación con base de conocimientos si es necesario

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

    /**
     * Obtiene el historial completo del ticket con toda la información anidada
     */
    @Transactional(readOnly = true)
    public TicketHistoryResponse getTicketHistory(Long ticketId) {
        log.debug("Obteniendo historial completo del ticket ID: {}", ticketId);

        Ticket ticket = ticketRepository.findByIdWithDetails(ticketId);
        if (ticket == null) {
            throw new RuntimeException("Ticket no encontrado: " + ticketId);
        }

        return mapToHistoryResponse(ticket);
    }

    /**
     * Mapea Ticket a TicketHistoryResponse con toda la información completa
     */
    private TicketHistoryResponse mapToHistoryResponse(Ticket ticket) {
        TicketHistoryResponse.TicketHistoryResponseBuilder builder = TicketHistoryResponse.builder()
                .idTicket(ticket.getIdTicket())
                .clienteId(ticket.getCliente() != null ? ticket.getCliente().getIdCliente() : null)
                .titulo(ticket.getAsunto())
                .motivo(ticket.getMotivo() != null ? ticket.getMotivo().getNombre() : "Sin motivo")
                .descripcion(ticket.getDescripcion())
                .estado(ticket.getEstado().name())
                .origen(ticket.getOrigen() != null ? ticket.getOrigen().getDisplayName() : "Desconocido")
                .tipoTicket(ticket.getTipoTicket() != null ? ticket.getTipoTicket().name() : "DESCONOCIDO")
                .fechaCreacion(ticket.getFechaCreacion())
                .fechaCierre(ticket.getFechaCierre())
                .asignaciones(ticket.getAsignaciones().stream()
                        .map(this::mapToAssignmentDto)
                        .collect(java.util.stream.Collectors.toList()));

        // Mapear información específica por tipo
        switch (ticket.getTipoTicket()) {
            case CONSULTA:
                Consulta consulta = consultaRepository.findById(ticket.getIdTicket()).orElse(null);
                if (consulta != null) {
                    builder.consultaInfo(TicketConsultaDto.builder()
                            .tema(consulta.getTema())
                            .build());
                }
                break;
            case QUEJA:
                Queja queja = quejaRepository.findById(ticket.getIdTicket()).orElse(null);
                if (queja != null) {
                    builder.quejaInfo(TicketQuejaDto.builder()
                            .impacto(queja.getImpacto())
                            .areaInvolucrada(queja.getAreaInvolucrada())
                            .build());
                }
                break;
            case SOLICITUD:
                Solicitud solicitud = solicitudRepository.findById(ticket.getIdTicket()).orElse(null);
                if (solicitud != null) {
                    builder.solicitudInfo(TicketSolicitudDto.builder()
                            .tipoSolicitud(solicitud.getTipoSolicitud())
                            .build());
                }
                break;
            case RECLAMO:
                Reclamo reclamo = reclamoRepository.findById(ticket.getIdTicket()).orElse(null);
                if (reclamo != null) {
                    builder.reclamoInfo(TicketReclamoDto.builder()
                            .motivoReclamo(reclamo.getMotivoReclamo())
                            .fechaLimiteRespuesta(reclamo.getFechaLimiteRespuesta())
                            .fechaLimiteResolucion(reclamo.getFechaLimiteResolucion())
                            .resultado(reclamo.getResultado())
                            .build());
                }
                break;
        }

        return builder.build();
    }

    /**
     * Mapea Asignacion a AssignmentDto con documentación y empleado
     */
    private AssignmentDto mapToAssignmentDto(Asignacion asignacion) {
        // Determinar tipo de asignación
        String tipo = asignacion.getAsignacionPadre() == null ? "Asignación Inicial" : "Derivación";
        
        // Determinar motivo de desplazamiento
        String motivoDesplazamiento = asignacion.getAsignacionPadre() != null 
                ? "Derivado desde área anterior" 
                : "Asignación directa";

        // Mapear empleado
        EmployeeDto empleadoDto = null;
        if (asignacion.getEmpleado() != null) {
            empleadoDto = mapToEmployeeDto(asignacion.getEmpleado());
        }

        // Buscar documentación asociada a esta asignación
        DocumentacionDto documentacionDto = null;
        Optional<Documentacion> docOpt = documentacionRepository.findByAsignacionId(asignacion.getIdAsignacion());
        if (docOpt.isPresent()) {
            documentacionDto = mapToDocumentacionDto(docOpt.get());
        }

        return AssignmentDto.builder()
                .idAsignacion(asignacion.getIdAsignacion())
                .tipo(tipo)
                .fechaInicio(asignacion.getFechaInicio())
                .fechaFin(asignacion.getFechaFin())
                .motivoDesplazamiento(motivoDesplazamiento)
                .area(asignacion.getAreaId() != null ? "Área ID: " + asignacion.getAreaId() : "Sin área")
                .empleado(empleadoDto)
                .documentacion(documentacionDto)
                .build();
    }

    /**
     * Mapea Empleado a EmployeeDto
     */
    private EmployeeDto mapToEmployeeDto(Empleado empleado) {
        // Separar nombre en nombre y apellido (asumiendo formato "Nombre Apellido")
        String nombreCompleto = empleado.getNombre();
        String[] partes = nombreCompleto != null ? nombreCompleto.split(" ", 2) : new String[]{"", ""};
        String nombre = partes.length > 0 ? partes[0] : "";
        String apellido = partes.length > 1 ? partes[1] : "";

        return EmployeeDto.builder()
                .idEmpleado(empleado.getIdEmpleado())
                .nombre(nombre)
                .apellido(apellido)
                .cargo(empleado.getPuesto())
                .area("Área por definir") // TODO: Obtener área real si existe
                .build();
    }

    /**
     * Mapea Documentacion a DocumentacionDto
     */
    private DocumentacionDto mapToDocumentacionDto(Documentacion doc) {
        // Obtener el empleado desde la asignación
        EmployeeDto autorDto = null;
        if (doc.getAsignacion() != null && doc.getAsignacion().getEmpleado() != null) {
            autorDto = mapToEmployeeDto(doc.getAsignacion().getEmpleado());
        }

        // Por ahora no hay relación con artículos KB en Documentacion
        ArticuloVersionDto articuloDto = null;
        // TODO: Agregar relación con base de conocimientos si es necesario

        return DocumentacionDto.builder()
                .idDocumentacion(doc.getIdDocumentacion().intValue()) // Convertir Long a Integer
                .problema(doc.getProblema())
                .articulo(doc.getSolucion()) // En Documentacion, 'solucion' es el contenido
                .fechaCreacion(doc.getFechaCreacion())
                .autor(autorDto)
                .articuloKB(articuloDto)
                .build();
    }
}
