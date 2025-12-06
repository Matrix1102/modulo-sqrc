package com.sqrc.module.backendsqrc.encuesta.listener;

import com.sqrc.module.backendsqrc.encuesta.event.TicketClosedForEncuestaEvent;
import com.sqrc.module.backendsqrc.encuesta.service.EncuestaService;
import com.sqrc.module.backendsqrc.vista360.service.Vista360Service;
import com.sqrc.module.backendsqrc.vista360.dto.ClienteBasicoDTO;
import com.sqrc.module.backendsqrc.ticket.model.Agente;
import com.sqrc.module.backendsqrc.ticket.model.Asignacion;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.model.TipoEmpleado;
import com.sqrc.module.backendsqrc.ticket.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;

/**
 * Listener que crea la encuesta únicamente después de que la transacción de cierre
 * del ticket haya hecho commit, evitando bloqueos por transacciones anidadas.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EncuestaAfterCommitListener {

    private final EncuestaService encuestaService;
    private final Vista360Service vista360Service;
    private final TicketRepository ticketRepository;
    private final EmpleadoRepository empleadoRepository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCreateEncuesta(TicketClosedForEncuestaEvent evt) {
        log.info("AFTER_COMMIT: creando encuesta para ticket {} (plantilla={})", evt.ticketId(), evt.plantillaId());
        try {
            // Cargar ticket con detalles para resolver asignaciones y cliente
            var ticket = ticketRepository.findByIdWithDetails(evt.ticketId());
            if (ticket == null) {
                log.warn("AFTER_COMMIT: ticket {} no encontrado, abortando creación de encuesta", evt.ticketId());
                return;
            }

            // Resolver el agente desde las asignaciones del ticket
            Long agenteId = null;
            if (ticket.getAsignaciones() != null && !ticket.getAsignaciones().isEmpty()) {
                log.debug("AFTER_COMMIT: ticket {} tiene {} asignaciones", evt.ticketId(), ticket.getAsignaciones().size());
                // Buscar cualquier asignación que tenga un empleado
                for (Asignacion asig : ticket.getAsignaciones()) {
                    if (asig.getEmpleado() != null) {
                        Long empId = asig.getEmpleado().getIdEmpleado();
                        TipoEmpleado tipo = asig.getEmpleado().getTipoEmpleado();
                        log.debug("AFTER_COMMIT: asignacion {} -> empleado {} tipo {} clase {}", 
                            asig.getIdAsignacion(), empId, tipo, asig.getEmpleado().getClass().getSimpleName());
                        
                        // Verificar si es un tipo de agente por TipoEmpleado (más confiable que instanceof con proxies)
                        if (tipo == TipoEmpleado.AGENTE_PRESENCIAL || tipo == TipoEmpleado.AGENTE_LLAMADA || tipo == TipoEmpleado.AGENTE) {
                            agenteId = empId;
                            log.debug("AFTER_COMMIT: agente resuelto por TipoEmpleado: {} (tipo={})", agenteId, tipo);
                        } else if (asig.getEmpleado() instanceof Agente) {
                            // Fallback: instanceof check
                            agenteId = empId;
                            log.debug("AFTER_COMMIT: agente resuelto por instanceof: {}", agenteId);
                        }
                    }
                }
            } else {
                log.warn("AFTER_COMMIT: ticket {} no tiene asignaciones cargadas", evt.ticketId());
            }
            if (agenteId == null) {
                log.warn("AFTER_COMMIT: no se encontró agente en las asignaciones del ticket {}", evt.ticketId());
            }

            var encuesta = encuestaService.crearEncuestaParaTicket(evt.plantillaId(), ticket, agenteId, ticket.getCliente());
            // Note: crearEncuestaParaTicket overload used in service expects ticket entity in some usages.
            // We call the simpler creation by plantilla/ticket via service layer if available; if not,
            // the EncuestaService method will resolve ticket/client/agent as needed by id.

            // If encuesta created, resolve client email and send the survey immediately
            if (encuesta != null) {
                Long encuestaId = encuesta.getIdEncuesta();
                log.info("AFTER_COMMIT: encuesta creada {}. Resolviendo correo cliente {}", encuestaId, evt.clienteId());
                try {
                    String correoDestino = null;
                    if (evt.clienteId() != null) {
                        try {
                            ClienteBasicoDTO cliente = vista360Service.obtenerClientePorId(evt.clienteId());
                            correoDestino = cliente != null ? cliente.getCorreo() : null;
                            log.debug("AFTER_COMMIT: correo resuelto desde Vista360: {}", correoDestino);
                        } catch (Exception e) {
                            log.warn("AFTER_COMMIT: no se pudo resolver cliente {}: {}", evt.clienteId(), e.getMessage());
                        }
                    }

                    if (correoDestino != null && !correoDestino.isBlank()) {
                        // Llamada a método transaccional que usa findByIdForUpdate internamente
                        encuestaService.enviarEncuestaManual(encuestaId.toString(), correoDestino, "Por favor complete esta encuesta", false);
                        log.info("AFTER_COMMIT: envío de encuesta {} solicitado para correo={}", encuestaId, correoDestino);
                    } else {
                        log.warn("AFTER_COMMIT: no se encontró correo para clienteId={} — no se envía encuesta {}", evt.clienteId(), encuestaId);
                    }
                } catch (Exception exSend) {
                    log.error("AFTER_COMMIT: error enviando encuesta {}: {}", encuestaId, exSend.getMessage(), exSend);
                }
            } else {
                log.warn("AFTER_COMMIT: crearEncuestaParaTicket devolvió null para ticket {}", evt.ticketId());
            }
        } catch (Exception ex) {
            log.error("AFTER_COMMIT: error creando encuesta para ticket {}: {}", evt.ticketId(), ex.getMessage(), ex);
        }
    }
}
