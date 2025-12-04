package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.dto.DocumentacionDto;
import com.sqrc.module.backendsqrc.ticket.dto.request.CreateDocumentacionRequest;
import com.sqrc.module.backendsqrc.ticket.dto.request.UpdateDocumentacionRequest;
import com.sqrc.module.backendsqrc.ticket.dto.response.DocumentacionCreatedResponse;
import com.sqrc.module.backendsqrc.ticket.exception.*;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.ticket.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de documentación de tickets.
 * 
 * La documentación contiene:
 * - Problema: Descripción detallada de la problemática del cliente
 * - Artículo KB: Referencia al artículo de Base de Conocimiento utilizado
 * - Solución: Descripción de la solución aplicada
 * 
 * Patrones utilizados:
 * - Service Layer: Encapsula lógica de negocio
 * - Repository Pattern: Acceso a datos (delegado)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentacionService {

    private final DocumentacionRepository documentacionRepository;
    private final AsignacionRepository asignacionRepository;
    private final EmpleadoRepository empleadoRepository;
    private final TicketRepository ticketRepository;

    /**
     * Crea una nueva documentación para un ticket.
     * 
     * La documentación se asocia a la asignación activa del ticket.
     * 
     * @param request DTO con los datos de la documentación
     * @return DocumentacionCreatedResponse con el resultado
     */
    @Transactional
    public DocumentacionCreatedResponse crearDocumentacion(CreateDocumentacionRequest request) {
        log.info("Creando documentación para ticket ID: {}", request.getTicketId());

        // Validar que existe el ticket
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new TicketNotFoundException(request.getTicketId()));

        // Validar que el ticket no está cerrado
        if (ticket.getEstado() == EstadoTicket.CERRADO) {
            throw new InvalidStateTransitionException("No se puede documentar un ticket cerrado");
        }

        // Obtener la asignación activa del ticket
        Asignacion asignacionActiva = asignacionRepository.findAsignacionActiva(request.getTicketId())
                .orElseThrow(() -> new AsignacionNotFoundException(
                        "No hay asignación activa para el ticket " + request.getTicketId()));

        // Validar empleado
        Empleado empleado = empleadoRepository.findById(request.getEmpleadoId())
                .orElseThrow(() -> new EmpleadoNotFoundException(request.getEmpleadoId()));

        // Crear documentación
        Documentacion documentacion = Documentacion.builder()
                .problema(request.getProblema())
                .idArticuloKB(request.getArticuloKBId())
                .solucion(request.getSolucion())
                .empleado(empleado)
                .asignacion(asignacionActiva)
                .build();

        Documentacion guardada = documentacionRepository.save(documentacion);
        log.debug("Documentación creada con ID: {}", guardada.getIdDocumentacion());

        return DocumentacionCreatedResponse.builder()
                .idDocumentacion(guardada.getIdDocumentacion())
                .ticketId(request.getTicketId())
                .problema(guardada.getProblema())
                .solucion(guardada.getSolucion())
                .articuloKBId(guardada.getIdArticuloKB())
                .nombreEmpleado(empleado.getNombreCompleto())
                .fechaCreacion(guardada.getFechaCreacion())
                .mensaje("Documentación creada exitosamente")
                .build();
    }

    /**
     * Actualiza una documentación existente.
     * 
     * @param documentacionId ID de la documentación
     * @param request DTO con los campos a actualizar
     * @return DocumentacionCreatedResponse con el resultado
     */
    @Transactional
    public DocumentacionCreatedResponse actualizarDocumentacion(Long documentacionId,
                                                                  UpdateDocumentacionRequest request) {
        log.info("Actualizando documentación ID: {}", documentacionId);

        Documentacion documentacion = documentacionRepository.findById(documentacionId)
                .orElseThrow(() -> new DocumentacionNotFoundException(documentacionId));

        // Validar que el ticket asociado no está cerrado
        Long ticketId = documentacion.getAsignacion().getTicket().getIdTicket();
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        if (ticket.getEstado() == EstadoTicket.CERRADO) {
            throw new InvalidStateTransitionException("No se puede modificar documentación de un ticket cerrado");
        }

        // Actualizar campos
        if (request.getProblema() != null) {
            documentacion.setProblema(request.getProblema());
        }
        if (request.getArticuloKBId() != null) {
            documentacion.setIdArticuloKB(request.getArticuloKBId());
        }
        if (request.getSolucion() != null) {
            documentacion.setSolucion(request.getSolucion());
        }

        Documentacion actualizada = documentacionRepository.save(documentacion);

        return DocumentacionCreatedResponse.builder()
                .idDocumentacion(actualizada.getIdDocumentacion())
                .ticketId(ticketId)
                .problema(actualizada.getProblema())
                .solucion(actualizada.getSolucion())
                .articuloKBId(actualizada.getIdArticuloKB())
                .nombreEmpleado(actualizada.getEmpleado() != null ? actualizada.getEmpleado().getNombre() : null)
                .fechaCreacion(actualizada.getFechaCreacion())
                .mensaje("Documentación actualizada exitosamente")
                .build();
    }

    /**
     * Obtiene la documentación de un ticket.
     * 
     * @param ticketId ID del ticket
     * @return Lista de DocumentacionDto
     */
    @Transactional(readOnly = true)
    public List<DocumentacionDto> obtenerDocumentacionPorTicket(Long ticketId) {
        log.debug("Obteniendo documentación del ticket ID: {}", ticketId);

        return documentacionRepository.findByTicketId(ticketId)
                .map(this::mapToDto)
                .stream()
                .collect(Collectors.toList());
    }

    /**
     * Obtiene una documentación específica por ID.
     * 
     * @param documentacionId ID de la documentación
     * @return DocumentacionDto
     */
    @Transactional(readOnly = true)
    public DocumentacionDto obtenerDocumentacionPorId(Long documentacionId) {
        log.debug("Obteniendo documentación ID: {}", documentacionId);

        Documentacion documentacion = documentacionRepository.findById(documentacionId)
                .orElseThrow(() -> new DocumentacionNotFoundException(documentacionId));

        return mapToDto(documentacion);
    }

    /**
     * Elimina una documentación.
     * 
     * @param documentacionId ID de la documentación
     */
    @Transactional
    public void eliminarDocumentacion(Long documentacionId) {
        log.info("Eliminando documentación ID: {}", documentacionId);

        Documentacion documentacion = documentacionRepository.findById(documentacionId)
                .orElseThrow(() -> new DocumentacionNotFoundException(documentacionId));

        // Validar que el ticket asociado no está cerrado
        Long ticketId = documentacion.getAsignacion().getTicket().getIdTicket();
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        if (ticket.getEstado() == EstadoTicket.CERRADO) {
            throw new InvalidStateTransitionException("No se puede eliminar documentación de un ticket cerrado");
        }

        documentacionRepository.delete(documentacion);
    }

    /**
     * Mapea Documentacion a DocumentacionDto.
     */
    private DocumentacionDto mapToDto(Documentacion doc) {
        DocumentacionDto.DocumentacionDtoBuilder builder = DocumentacionDto.builder()
                .idDocumentacion(doc.getIdDocumentacion())
                .problema(doc.getProblema())
                .articulo(doc.getSolucion())
                .fechaCreacion(doc.getFechaCreacion());

        if (doc.getEmpleado() != null) {
            Empleado empleado = doc.getEmpleado();
            builder.autor(com.sqrc.module.backendsqrc.ticket.dto.EmployeeDto.builder()
                    .idEmpleado(empleado.getIdEmpleado())
                    .nombre(empleado.getNombre())
                    .apellido(empleado.getApellido())
                    .cargo(empleado.getTipoEmpleado() != null ? empleado.getTipoEmpleado().name() : "Sin cargo")
                    .area(empleado.getArea())
                    .build());
        }

        if (doc.getIdArticuloKB() != null) {
            builder.articuloKB(com.sqrc.module.backendsqrc.ticket.dto.ArticuloVersionDto.builder()
                    .idArticuloKB(doc.getIdArticuloKB())
                    .titulo("Artículo KB-" + doc.getIdArticuloKB())
                    .build());
        }

        return builder.build();
    }

    /**
     * Registra la documentación de un escalamiento.
     *
     * @param ticket El ticket que está siendo escalado
     * @param problema Descripción técnica del problema
     * @param justificacion Razón por la que se escala (se guarda en el campo 'solucion')
     */
    @Transactional
    public void registrarEscalamiento(Ticket ticket, String problema, String justificacion) {
        // Obtener la asignación activa del ticket
        Asignacion asignacionActiva = asignacionRepository.findAsignacionActiva(ticket.getIdTicket())
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró asignación activa para el ticket: " + ticket.getIdTicket()
                ));

        // Crear la documentación
        Documentacion documentacion = Documentacion.builder()
                .asignacion(asignacionActiva)
                .problema(problema)
                .solucion(justificacion) // La justificación se guarda en el campo 'solucion'
                .empleado(asignacionActiva.getEmpleado()) // Empleado de la asignación actual
                .build();

        documentacionRepository.save(documentacion);

        System.out.println("📝 [DOCUMENTACION] Escalamiento registrado para Ticket ID: " + ticket.getIdTicket());
        System.out.println("    → Problema: " + problema);
        System.out.println("    → Justificación: " + justificacion);
    }
}
