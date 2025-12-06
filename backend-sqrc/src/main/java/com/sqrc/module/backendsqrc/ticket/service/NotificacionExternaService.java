package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.dto.NotificacionExternaDTO;
import com.sqrc.module.backendsqrc.ticket.model.NotificacionExterna;
import com.sqrc.module.backendsqrc.ticket.repository.NotificacionExternaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar notificaciones externas.
 * Proporciona métodos para consultar y convertir notificaciones a DTOs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacionExternaService {

    private final NotificacionExternaRepository repository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Obtiene todas las notificaciones externas de un ticket específico.
     * Útil para mostrar el historial de derivaciones en el timeline.
     *
     * @param ticketId ID del ticket
     * @return Lista de NotificacionExternaDTO
     */
    @Transactional(readOnly = true)
    public List<NotificacionExternaDTO> obtenerPorTicket(Long ticketId) {
        log.debug("Obteniendo notificaciones externas para ticket ID: {}", ticketId);

        List<NotificacionExterna> notificaciones = repository.findByTicket_IdTicket(ticketId);

        log.debug("Se encontraron {} notificaciones para el ticket {}", notificaciones.size(), ticketId);

        return notificaciones.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista todas las notificaciones externas ordenadas por fecha.
     * Útil para el simulador de área externa.
     *
     * @return Lista de todas las NotificacionExternaDTO
     */
    @Transactional(readOnly = true)
    public List<NotificacionExternaDTO> listarTodas() {
        log.debug("Listando todas las notificaciones externas");

        return repository.findAllByOrderByFechaEnvioDesc().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Convierte una entidad NotificacionExterna a DTO.
     *
     * @param notificacion Entidad a convertir
     * @return NotificacionExternaDTO
     */
    private NotificacionExternaDTO convertirADTO(NotificacionExterna notificacion) {
        return new NotificacionExternaDTO(
                notificacion.getIdNotificacion(),
                notificacion.getTicket() != null ? notificacion.getTicket().getIdTicket() : null,
                notificacion.getAreaDestinoId(),
                notificacion.getAsunto(),
                notificacion.getCuerpo(),
                notificacion.getDestinatarioEmail(),
                notificacion.getFechaEnvio() != null ? notificacion.getFechaEnvio().format(FORMATTER) : null,
                notificacion.getRespuesta(),
                notificacion.getFechaRespuesta() != null ? notificacion.getFechaRespuesta().format(FORMATTER) : null
        );
    }
}

