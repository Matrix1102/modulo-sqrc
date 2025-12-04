package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.dto.LlamadaDto;
import com.sqrc.module.backendsqrc.ticket.dto.request.AsociarLlamadaRequest;
import com.sqrc.module.backendsqrc.ticket.dto.request.CreateLlamadaRequest;
import com.sqrc.module.backendsqrc.ticket.exception.EmpleadoNotFoundException;
import com.sqrc.module.backendsqrc.ticket.exception.TicketNotFoundException;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.ticket.repository.EmpleadoRepository;
import com.sqrc.module.backendsqrc.ticket.repository.LlamadaRepository;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de llamadas.
 * 
 * Regla de Negocio: Un ticket solo puede tener una llamada asociada.
 * 
 * Patrones utilizados:
 * - Service Layer: Encapsula lógica de negocio
 * - Repository Pattern: Acceso a datos (delegado)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LlamadaService {

    private final LlamadaRepository llamadaRepository;
    private final TicketRepository ticketRepository;
    private final EmpleadoRepository empleadoRepository;

    /**
     * Crea una nueva llamada (sin ticket asociado).
     * 
     * @param request DTO con los datos de la llamada
     * @return LlamadaDto con la llamada creada
     */
    @Transactional
    public LlamadaDto crearLlamada(CreateLlamadaRequest request) {
        log.info("Creando nueva llamada para empleado: {}", request.getEmpleadoId());

        Empleado empleado = empleadoRepository.findById(request.getEmpleadoId())
                .orElseThrow(() -> new EmpleadoNotFoundException(request.getEmpleadoId()));

        Llamada llamada = Llamada.builder()
                .numeroOrigen(request.getNumeroOrigen())
                .empleado(empleado)
                .estado(request.getEstado() != null ? request.getEstado() : EstadoLlamada.ACEPTADA)
                .build();

        Llamada guardada = llamadaRepository.save(llamada);
        log.debug("Llamada creada con ID: {}", guardada.getIdLlamada());

        return mapToDto(guardada);
    }

    /**
     * Asocia una llamada existente a un ticket.
     * 
     * Regla de Negocio: Un ticket solo puede tener una llamada.
     * 
     * @param request DTO con IDs de llamada y ticket
     * @return LlamadaDto con la llamada actualizada
     */
    @Transactional
    public LlamadaDto asociarLlamadaATicket(AsociarLlamadaRequest request) {
        log.info("Asociando llamada {} al ticket {}", request.getLlamadaId(), request.getTicketId());

        // Verificar que el ticket existe
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new TicketNotFoundException(request.getTicketId()));

        // Verificar que el ticket no tiene ya una llamada
        if (llamadaRepository.existsByTicketIdTicket(request.getTicketId())) {
            throw new IllegalStateException("El ticket ya tiene una llamada asociada");
        }

        // Verificar que la llamada existe
        Llamada llamada = llamadaRepository.findById(request.getLlamadaId())
                .orElseThrow(() -> new RuntimeException("Llamada no encontrada: " + request.getLlamadaId()));

        // Verificar que la llamada no está asociada a otro ticket
        if (llamada.getTicket() != null) {
            throw new IllegalStateException("La llamada ya está asociada a otro ticket");
        }

        // Asociar llamada al ticket
        llamada.setTicket(ticket);
        Llamada actualizada = llamadaRepository.save(llamada);

        return mapToDto(actualizada);
    }

    /**
     * Finaliza una llamada.
     * 
     * @param llamadaId ID de la llamada
     * @param duracionSegundos Duración total en segundos
     * @return LlamadaDto con la llamada actualizada
     */
    @Transactional
    public LlamadaDto finalizarLlamada(Long llamadaId, Integer duracionSegundos) {
        log.info("Finalizando llamada {} con duración {} segundos", llamadaId, duracionSegundos);

        Llamada llamada = llamadaRepository.findById(llamadaId)
                .orElseThrow(() -> new RuntimeException("Llamada no encontrada: " + llamadaId));

        llamada.setEstado(EstadoLlamada.FINALIZADA);
        llamada.setDuracionSegundos(duracionSegundos);
        Llamada actualizada = llamadaRepository.save(llamada);

        return mapToDto(actualizada);
    }

    /**
     * Cambia el estado de una llamada.
     * 
     * @param llamadaId ID de la llamada
     * @param nuevoEstado Nuevo estado
     * @return LlamadaDto con la llamada actualizada
     */
    @Transactional
    public LlamadaDto cambiarEstado(Long llamadaId, EstadoLlamada nuevoEstado) {
        log.info("Cambiando estado de llamada {} a {}", llamadaId, nuevoEstado);

        Llamada llamada = llamadaRepository.findById(llamadaId)
                .orElseThrow(() -> new RuntimeException("Llamada no encontrada: " + llamadaId));

        llamada.setEstado(nuevoEstado);
        Llamada actualizada = llamadaRepository.save(llamada);

        return mapToDto(actualizada);
    }

    /**
     * Obtiene una llamada por ID.
     * 
     * @param llamadaId ID de la llamada
     * @return LlamadaDto
     */
    @Transactional(readOnly = true)
    public LlamadaDto obtenerLlamadaPorId(Long llamadaId) {
        Llamada llamada = llamadaRepository.findById(llamadaId)
                .orElseThrow(() -> new RuntimeException("Llamada no encontrada: " + llamadaId));
        return mapToDto(llamada);
    }

    /**
     * Obtiene la llamada asociada a un ticket.
     * 
     * @param ticketId ID del ticket
     * @return LlamadaDto o null si no tiene llamada
     */
    @Transactional(readOnly = true)
    public LlamadaDto obtenerLlamadaPorTicket(Long ticketId) {
        return llamadaRepository.findByTicketIdTicket(ticketId)
                .map(this::mapToDto)
                .orElse(null);
    }

    /**
     * Obtiene llamadas sin ticket de un empleado (disponibles para asociar).
     * 
     * @param empleadoId ID del empleado
     * @return Lista de LlamadaDto
     */
    @Transactional(readOnly = true)
    public List<LlamadaDto> obtenerLlamadasDisponibles(Long empleadoId) {
        return llamadaRepository.findLlamadasSinTicketPorEmpleado(empleadoId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene llamadas de un empleado.
     * 
     * @param empleadoId ID del empleado
     * @return Lista de LlamadaDto
     */
    @Transactional(readOnly = true)
    public List<LlamadaDto> obtenerLlamadasPorEmpleado(Long empleadoId) {
        return llamadaRepository.findByEmpleadoIdEmpleado(empleadoId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Mapea Llamada a LlamadaDto.
     */
    private LlamadaDto mapToDto(Llamada llamada) {
        return LlamadaDto.builder()
                .idLlamada(llamada.getIdLlamada())
                .fechaHora(llamada.getFechaHora())
                .duracionSegundos(llamada.getDuracionSegundos())
                .duracionFormateada(formatearDuracion(llamada.getDuracionSegundos()))
                .numeroOrigen(llamada.getNumeroOrigen())
                .estado(llamada.getEstado())
                .ticketId(llamada.getTicket() != null ? llamada.getTicket().getIdTicket() : null)
                .empleadoId(llamada.getEmpleado() != null ? llamada.getEmpleado().getIdEmpleado() : null)
                .nombreEmpleado(llamada.getEmpleado() != null ? llamada.getEmpleado().getNombre() : null)
                .build();
    }

    /**
     * Formatea la duración en formato HH:MM:SS
     */
    private String formatearDuracion(Integer segundos) {
        if (segundos == null || segundos == 0) {
            return "00:00:00";
        }
        int horas = segundos / 3600;
        int minutos = (segundos % 3600) / 60;
        int segs = segundos % 60;
        return String.format("%02d:%02d:%02d", horas, minutos, segs);
    }
}
