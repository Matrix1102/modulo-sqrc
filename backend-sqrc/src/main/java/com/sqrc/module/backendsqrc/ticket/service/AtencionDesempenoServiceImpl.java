package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.dto.DesempenoAsignacionDTO;
import com.sqrc.module.backendsqrc.ticket.model.Asignacion;
import com.sqrc.module.backendsqrc.ticket.model.Queja;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.model.TipoTicket;
import com.sqrc.module.backendsqrc.ticket.repository.AsignacionRepository;
import com.sqrc.module.backendsqrc.ticket.repository.QuejaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de desempeño de atención.
 * 
 * Sigue un proceso de 3 pasos para armar la respuesta:
 * 1. Identificación: Consulta asignaciones por empleado_id
 * 2. Recuperación de datos comunes: Obtiene asunto, estado y categoría del ticket
 * 3. Búsqueda condicional: Si es QUEJA, obtiene el nivel de impacto
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AtencionDesempenoServiceImpl implements AtencionDesempenoService {

    private final AsignacionRepository asignacionRepository;
    private final QuejaRepository quejaRepository;

    @Override
    public List<DesempenoAsignacionDTO> getDesempenoPorEmpleado(Long empleadoId) {
        log.info("Obteniendo desempeño para empleado_id: {}", empleadoId);

        // PASO 1: Identificación - Obtener todas las asignaciones del empleado
        List<Asignacion> asignaciones = asignacionRepository.findByEmpleadoIdWithTicket(empleadoId);
        
        log.debug("Se encontraron {} asignaciones para el empleado {}", asignaciones.size(), empleadoId);

        // PASO 2 y 3: Mapear cada asignación a DTO con datos del ticket y detalles condicionales
        return asignaciones.stream()
                .map(this::mapToDesempenoDTO)
                .collect(Collectors.toList());
    }

    /**
     * Mapea una Asignación a DesempenoAsignacionDTO.
     * Incluye la lógica de búsqueda condicional para Quejas.
     */
    private DesempenoAsignacionDTO mapToDesempenoDTO(Asignacion asignacion) {
        Ticket ticket = asignacion.getTicket();

        // PASO 2: Datos comunes del ticket
        DesempenoAsignacionDTO.DesempenoAsignacionDTOBuilder builder = DesempenoAsignacionDTO.builder()
                .idAsignacion(asignacion.getIdAsignacion())
                .idTicket(ticket.getIdTicket())
                .fechaAsignacion(asignacion.getFechaInicio())
                .fechaFinAsignacion(asignacion.getFechaFin())
                .estadoTicket(ticket.getEstado() != null ? ticket.getEstado().name() : null)
                .categoriaTicket(ticket.getTipoTicket() != null ? ticket.getTipoTicket().name() : null)
                .asuntoTicket(ticket.getAsunto());

        // PASO 3: Búsqueda condicional - Solo si es QUEJA
        if (ticket.getTipoTicket() == TipoTicket.QUEJA) {
            quejaRepository.findById(ticket.getIdTicket())
                    .ifPresent(queja -> builder.nivelImpacto(queja.getImpacto()));
        }

        return builder.build();
    }
}
