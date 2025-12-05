package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.dto.CorreoDTO;
import com.sqrc.module.backendsqrc.ticket.model.Correo;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.repository.CorreoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar las consultas de correos asociados a tickets.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CorreoService {

    private final CorreoRepository correoRepository;

    /**
     * Obtiene todos los correos asociados a un ticket específico.
     * Los correos están ordenados por fecha de envío (más recientes primero).
     *
     * @param ticketId ID del ticket
     * @return Lista de correos en formato DTO
     */
    @Transactional(readOnly = true)
    public List<CorreoDTO> obtenerCorreosPorTicket(Long ticketId) {
        log.info("Obteniendo correos para el ticket ID: {}", ticketId);

        List<Correo> correos = correoRepository.findByAsignacion_Ticket_IdTicket(ticketId);

        log.info("Se encontraron {} correos para el ticket {}", correos.size(), ticketId);

        return correos.stream()
                .map(this::convertirADTO)
                .sorted((c1, c2) -> c2.getFechaEnvio().compareTo(c1.getFechaEnvio())) // Más recientes primero
                .collect(Collectors.toList());
    }

    /**
     * Convierte una entidad Correo a CorreoDTO
     *
     * @param correo Entidad Correo
     * @return CorreoDTO con toda la información
     */
    private CorreoDTO convertirADTO(Correo correo) {
        Empleado empleado = correo.getAsignacion().getEmpleado();

        return CorreoDTO.builder()
                .idCorreo(correo.getIdCorreo())
                .asunto(correo.getAsunto())
                .cuerpo(correo.getCuerpo())
                .fechaEnvio(correo.getFechaEnvio())
                .tipoCorreo(correo.getTipoCorreo())
                .idAsignacion(correo.getAsignacion().getIdAsignacion())
                .ticketId(correo.getAsignacion().getTicket().getIdTicket())
                .empleadoId(empleado.getIdEmpleado())
                .empleadoNombre(empleado.getNombreCompleto())
                .empleadoCorreo(empleado.getCorreo())
                .empleadoArea(empleado.getArea())
                .build();
    }
}
