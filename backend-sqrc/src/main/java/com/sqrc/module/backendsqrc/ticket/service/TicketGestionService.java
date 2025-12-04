package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.encuesta.event.TicketClosedEvent;
import com.sqrc.module.backendsqrc.encuesta.model.Encuesta;
import com.sqrc.module.backendsqrc.encuesta.model.PlantillaEncuesta;
import com.sqrc.module.backendsqrc.encuesta.repository.PlantillaEncuestaRepository;
import com.sqrc.module.backendsqrc.encuesta.service.EncuestaService;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.RespuestaService;
import com.sqrc.module.backendsqrc.ticket.dto.request.*;
import com.sqrc.module.backendsqrc.ticket.dto.response.*;
import com.sqrc.module.backendsqrc.ticket.exception.*;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.ticket.repository.*;
import com.sqrc.module.backendsqrc.ticket.service.factory.TicketFactory;
import com.sqrc.module.backendsqrc.ticket.service.strategy.DefaultEstadoTransitionValidator;
import com.sqrc.module.backendsqrc.vista360.model.ClienteEntity;
import com.sqrc.module.backendsqrc.vista360.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Servicio para la gestión completa del ciclo de vida de tickets.
 * 
 * Patrones utilizados:
 * - Service Layer: Encapsula lógica de negocio
 * - Factory Method: Delegado a TicketFactory para crear diferentes tipos de tickets
 * - Strategy: Delegado a EstadoTransitionValidator para validar transiciones
 * - Template Method: Flujo común en operaciones de tickets
 * 
 * Responsabilidades:
 * - CRUD de tickets (crear, actualizar)
 * - Cambio de estados
 * - Escalamiento y derivación
 * - Cierre de tickets
 * 
 * Validaciones de Roles:
 * - AgenteLlamada solo puede crear tickets con origen LLAMADA
 * - AgentePresencial solo puede crear tickets con origen PRESENCIAL
 * - BackOffice puede recibir tickets escalados y derivar
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketGestionService {

    private final TicketRepository ticketRepository;
    private final ConsultaRepository consultaRepository;
    private final QuejaRepository quejaRepository;
    private final ReclamoRepository reclamoRepository;
    private final SolicitudRepository solicitudRepository;
    private final AsignacionRepository asignacionRepository;
    private final EmpleadoRepository empleadoRepository;
    private final MotivoRepository motivoRepository;
    private final ClienteRepository clienteRepository;
    private final BackOfficeRepository backOfficeRepository;
    private final TicketFactory ticketFactory;
    private final DefaultEstadoTransitionValidator transitionValidator;
    
    // Dependencias para el patrón Observer (encuestas al cerrar ticket)
    private final ApplicationEventPublisher eventPublisher;
    private final EncuestaService encuestaService;
    private final PlantillaEncuestaRepository plantillaEncuestaRepository;

    private final RespuestaService respuestaService;

    // ==================== CREAR TICKET ====================

    /**
     * Crea un nuevo ticket con su asignación inicial.
     * 
     * Flujo:
     * 1. Validar y obtener entidades relacionadas (cliente, empleado, motivo)
     * 2. Validar que el Agente puede crear tickets del canal especificado
     * 3. Usar Factory para crear el ticket del tipo correcto
     * 4. Guardar el ticket
     * 5. Crear asignación inicial al empleado
     * 6. Retornar respuesta con datos del ticket creado
     * 
     * Reglas de Negocio:
     * - AgenteLlamada solo puede crear tickets con origen LLAMADA
     * - AgentePresencial solo puede crear tickets con origen PRESENCIAL
     * 
     * @param request DTO con datos del ticket
     * @return TicketCreatedResponse con información del ticket creado
     */
    @Transactional
    public TicketCreatedResponse crearTicket(CreateTicketRequest request) {
        log.info("Creando ticket de tipo {} para cliente {}", request.getTipoTicket(), request.getClienteId());

        // 1. Validar y obtener cliente
        ClienteEntity cliente = clienteRepository.findByIdClienteAndActivoTrue(request.getClienteId())
                .orElseThrow(() -> new ClienteNotFoundException(request.getClienteId()));

        // 2. Validar y obtener empleado
        Empleado empleado = empleadoRepository.findById(request.getEmpleadoId())
                .orElseThrow(() -> new EmpleadoNotFoundException(request.getEmpleadoId()));

        // 3. Validar que el empleado puede crear tickets del canal especificado
        validarCanalPorTipoEmpleado(empleado, request.getOrigen());

        // 4. Obtener motivo si se especifica
        Motivo motivo = null;
        if (request.getMotivoId() != null) {
            motivo = motivoRepository.findById(request.getMotivoId())
                    .orElse(null);
        }

        // 5. Crear ticket usando Factory (patrón Factory Method)
        Ticket ticket = ticketFactory.crearTicket(request, cliente, motivo);

        // 6. Guardar ticket
        Ticket ticketGuardado = ticketRepository.save(ticket);
        log.debug("Ticket guardado con ID: {}", ticketGuardado.getIdTicket());

        // 7. Crear asignación inicial
        Asignacion asignacion = Asignacion.builder()
                .ticket(ticketGuardado)
                .empleado(empleado)
                .build();
        asignacionRepository.save(asignacion);
        log.debug("Asignación creada para empleado: {}", empleado.getNombreCompleto());

        // 8. Si es un Agente, marcarlo como ocupado
        if (empleado instanceof Agente) {
            ((Agente) empleado).setEstaOcupado(true);
            empleadoRepository.save(empleado);
        }

        // envia correo de confirmacion
        respuestaService.enviarConfirmacionRegistro(asignacion);

        // 9. Construir respuesta
        return TicketCreatedResponse.builder()
                .idTicket(ticketGuardado.getIdTicket())
                .asunto(ticketGuardado.getAsunto())
                .tipoTicket(ticketGuardado.getTipoTicket().name())
                .estado(ticketGuardado.getEstado().name())
                .origen(ticketGuardado.getOrigen().name())
                .fechaCreacion(ticketGuardado.getFechaCreacion())
                .clienteId(cliente.getIdCliente())
                .nombreCliente(cliente.getNombres() + " " + cliente.getApellidos())
                .empleadoAsignadoId(empleado.getIdEmpleado())
                .nombreEmpleadoAsignado(empleado.getNombreCompleto())
                .mensaje("Ticket creado exitosamente")
                .build();
    }

    /**
     * Valida que el empleado puede crear tickets del canal especificado.
     * 
     * Reglas:
     * - AgenteLlamada -> solo LLAMADA
     * - AgentePresencial -> solo PRESENCIAL
     * - Otros empleados -> cualquier canal (para pruebas/admin)
     */
    private void validarCanalPorTipoEmpleado(Empleado empleado, OrigenTicket origen) {
        if (empleado instanceof Agente) {
            Agente agente = (Agente) empleado;
            if (!agente.puedeAtenderCanal(origen)) {
                throw new InvalidStateTransitionException(
                        String.format("El %s no puede crear tickets con origen %s. Solo puede atender canal %s",
                                agente.getClass().getSimpleName(),
                                origen,
                                agente.getCanalOrigen()));
            }
        }
        // BackOffice y Supervisor no crean tickets directamente en flujo normal
        // pero permitimos para flexibilidad del sistema
    }

    // ==================== ACTUALIZAR TICKET ====================

    /**
     * Actualiza los campos de un ticket existente.
     * Solo se pueden actualizar tickets que NO estén CERRADOS.
     * 
     * @param ticketId ID del ticket a actualizar
     * @param request DTO con los campos a actualizar
     * @return TicketOperationResponse con el resultado
     */
    @Transactional
    public TicketOperationResponse actualizarTicket(Long ticketId, UpdateTicketRequest request) {
        log.info("Actualizando ticket ID: {}", ticketId);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        // Validar que no esté cerrado
        if (ticket.getEstado() == EstadoTicket.CERRADO) {
            throw new InvalidStateTransitionException("No se puede modificar un ticket cerrado");
        }

        String estadoAnterior = ticket.getEstado().name();

        // Actualizar campos base
        if (request.getAsunto() != null) {
            ticket.setAsunto(request.getAsunto());
        }
        if (request.getDescripcion() != null) {
            ticket.setDescripcion(request.getDescripcion());
        }
        if (request.getMotivoId() != null) {
            Motivo motivo = motivoRepository.findById(request.getMotivoId()).orElse(null);
            ticket.setMotivo(motivo);
        }

        // Actualizar campos específicos según tipo
        actualizarCamposEspecificos(ticket, request);

        ticketRepository.save(ticket);

        return TicketOperationResponse.builder()
                .ticketId(ticketId)
                .estadoAnterior(estadoAnterior)
                .estadoActual(ticket.getEstado().name())
                .operacion("ACTUALIZAR")
                .fechaOperacion(LocalDateTime.now())
                .mensaje("Ticket actualizado exitosamente")
                .exitoso(true)
                .build();
    }

    /**
     * Actualiza campos específicos según el tipo de ticket.
     * 
     * Patrón: Template Method (variación por tipo)
     */
    private void actualizarCamposEspecificos(Ticket ticket, UpdateTicketRequest request) {
        switch (ticket.getTipoTicket()) {
            case CONSULTA:
                if (request.getTema() != null) {
                    Consulta consulta = consultaRepository.findById(ticket.getIdTicket())
                            .orElseThrow(() -> new TicketNotFoundException(ticket.getIdTicket()));
                    consulta.setTema(request.getTema());
                    consultaRepository.save(consulta);
                }
                break;

            case QUEJA:
                Queja queja = quejaRepository.findById(ticket.getIdTicket())
                        .orElseThrow(() -> new TicketNotFoundException(ticket.getIdTicket()));
                if (request.getImpacto() != null) {
                    queja.setImpacto(request.getImpacto());
                }
                if (request.getAreaInvolucrada() != null) {
                    queja.setAreaInvolucrada(request.getAreaInvolucrada());
                }
                quejaRepository.save(queja);
                break;

            case RECLAMO:
                Reclamo reclamo = reclamoRepository.findById(ticket.getIdTicket())
                        .orElseThrow(() -> new TicketNotFoundException(ticket.getIdTicket()));
                if (request.getMotivoReclamo() != null) {
                    reclamo.setMotivoReclamo(request.getMotivoReclamo());
                }
                if (request.getResultado() != null) {
                    reclamo.setResultado(request.getResultado());
                }
                reclamoRepository.save(reclamo);
                break;

            case SOLICITUD:
                if (request.getTipoSolicitud() != null) {
                    Solicitud solicitud = solicitudRepository.findById(ticket.getIdTicket())
                            .orElseThrow(() -> new TicketNotFoundException(ticket.getIdTicket()));
                    solicitud.setTipoSolicitud(request.getTipoSolicitud());
                    solicitudRepository.save(solicitud);
                }
                break;
        }
    }

    // ==================== CAMBIAR ESTADO ====================

    /**
     * Cambia el estado de un ticket validando las reglas de negocio.
     * 
     * Usa Strategy Pattern para validar transiciones.
     * 
     * @param ticketId ID del ticket
     * @param request DTO con el nuevo estado
     * @return TicketOperationResponse con el resultado
     */
    @Transactional
    public TicketOperationResponse cambiarEstado(Long ticketId, CambiarEstadoRequest request) {
        log.info("Cambiando estado del ticket {} a {}", ticketId, request.getNuevoEstado());

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        EstadoTicket estadoActual = ticket.getEstado();
        EstadoTicket nuevoEstado = request.getNuevoEstado();

        // Validar transición usando Strategy
        if (!transitionValidator.esTransicionValida(estadoActual, nuevoEstado)) {
            String mensaje = transitionValidator.getMensajeError(estadoActual, nuevoEstado);
            throw new InvalidStateTransitionException(mensaje);
        }

        // Aplicar cambio de estado
        ticket.setEstado(nuevoEstado);

        // Si se cierra, establecer fecha de cierre
        if (nuevoEstado == EstadoTicket.CERRADO) {
            ticket.setFechaCierre(LocalDateTime.now());
            
            // Finalizar asignación activa
            finalizarAsignacionActiva(ticketId);
        }

        ticketRepository.save(ticket);

        return TicketOperationResponse.builder()
                .ticketId(ticketId)
                .estadoAnterior(estadoActual.name())
                .estadoActual(nuevoEstado.name())
                .operacion("CAMBIAR_ESTADO")
                .fechaOperacion(LocalDateTime.now())
                .mensaje("Estado cambiado exitosamente")
                .exitoso(true)
                .build();
    }

    // ==================== ESCALAR TICKET ====================

    /**
     * Escala un ticket de Agente a BackOffice.
     * 
     * Flujo:
     * 1. Validar que el ticket esté ABIERTO
     * 2. Validar que el destinatario sea un BackOffice
     * 3. Finalizar asignación del Agente
     * 4. Crear nueva asignación al BackOffice
     * 5. Cambiar estado a ESCALADO
     * 
     * Reglas de Negocio:
     * - Solo tickets ABIERTO pueden escalarse
     * - El destinatario debe ser un BackOffice
     * - Se libera al Agente que tenía el ticket
     * 
     * @param ticketId ID del ticket
     * @param request DTO con datos de escalamiento
     * @return TicketOperationResponse con el resultado
     */
    @Transactional
    public TicketOperationResponse escalarTicket(Long ticketId, EscalarTicketRequest request) {
        log.info("Escalando ticket {} al BackOffice {}", ticketId, request.getBackofficeId());

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        // Validar que se puede escalar
        if (!transitionValidator.puedeEscalar(ticket.getEstado())) {
            throw new InvalidStateTransitionException(
                    "Solo se pueden escalar tickets en estado ABIERTO. Estado actual: " + ticket.getEstado());
        }

        // Validar que el empleado destino sea un BackOffice
        BackOffice backoffice = backOfficeRepository.findById(request.getBackofficeId())
                .orElseThrow(() -> new InvalidStateTransitionException(
                        "El empleado con ID " + request.getBackofficeId() + 
                        " no es un BackOffice o no existe. Solo se puede escalar a empleados BackOffice."));

        // Obtener asignación activa y finalizarla
        Optional<Asignacion> asignacionActiva = asignacionRepository.findAsignacionActiva(ticketId);
        Asignacion asignacionAnterior = null;
        if (asignacionActiva.isPresent()) {
            asignacionAnterior = asignacionActiva.get();
            asignacionAnterior.setFechaFin(LocalDateTime.now());
            asignacionRepository.save(asignacionAnterior);
            
            // Liberar al Agente si estaba ocupado
            Empleado empleadoAnterior = asignacionAnterior.getEmpleado();
            if (empleadoAnterior instanceof Agente) {
                ((Agente) empleadoAnterior).setEstaOcupado(false);
                empleadoRepository.save(empleadoAnterior);
            }
        }

        // Crear nueva asignación al BackOffice
        Asignacion nuevaAsignacion = Asignacion.builder()
                .ticket(ticket)
                .empleado(backoffice)
                .asignacionPadre(asignacionAnterior)
                .build();
        asignacionRepository.save(nuevaAsignacion);

        // Cambiar estado a ESCALADO
        String estadoAnterior = ticket.getEstado().name();
        ticket.setEstado(EstadoTicket.ESCALADO);
        ticketRepository.save(ticket);

        return TicketOperationResponse.builder()
                .ticketId(ticketId)
                .estadoAnterior(estadoAnterior)
                .estadoActual(EstadoTicket.ESCALADO.name())
                .operacion("ESCALAR")
                .fechaOperacion(LocalDateTime.now())
                .mensaje("Ticket escalado exitosamente al BackOffice: " + backoffice.getNombreCompleto())
                .exitoso(true)
                .build();
    }

    // ==================== DERIVAR TICKET ====================

    /**
     * Deriva un ticket del BackOffice a un área especializada.
     * 
     * Flujo:
     * 1. Validar que el ticket esté ESCALADO
     * 2. Finalizar asignación del BackOffice
     * 3. Crear nueva asignación al área
     * 4. Cambiar estado a DERIVADO
     * 
     * @param ticketId ID del ticket
     * @param request DTO con datos de derivación
     * @return TicketOperationResponse con el resultado
     */
    @Transactional
    public TicketOperationResponse derivarTicket(Long ticketId, DerivarTicketRequest request) {
        log.info("Derivando ticket {} al área {}", ticketId, request.getAreaId());

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        // Validar que se puede derivar
        if (!transitionValidator.puedeDerivar(ticket.getEstado())) {
            throw new InvalidStateTransitionException(
                    "Solo se pueden derivar tickets en estado ESCALADO. Estado actual: " + ticket.getEstado());
        }

        // Obtener asignación activa y finalizarla
        Optional<Asignacion> asignacionActiva = asignacionRepository.findAsignacionActiva(ticketId);
        Asignacion asignacionAnterior = null;
        if (asignacionActiva.isPresent()) {
            asignacionAnterior = asignacionActiva.get();
            asignacionAnterior.setFechaFin(LocalDateTime.now());
            asignacionRepository.save(asignacionAnterior);
        }

        // Crear nueva asignación al área
        Asignacion nuevaAsignacion = Asignacion.builder()
                .ticket(ticket)
                .areaId(request.getAreaId())
                .asignacionPadre(asignacionAnterior)
                .build();
        asignacionRepository.save(nuevaAsignacion);

        // Cambiar estado a DERIVADO
        String estadoAnterior = ticket.getEstado().name();
        ticket.setEstado(EstadoTicket.DERIVADO);
        ticketRepository.save(ticket);

        return TicketOperationResponse.builder()
                .ticketId(ticketId)
                .estadoAnterior(estadoAnterior)
                .estadoActual(EstadoTicket.DERIVADO.name())
                .operacion("DERIVAR")
                .fechaOperacion(LocalDateTime.now())
                .mensaje("Ticket derivado exitosamente al área ID: " + request.getAreaId())
                .exitoso(true)
                .build();
    }

    // ==================== DEVOLVER TICKET ====================

    /**
     * Devuelve un ticket al estado anterior (rechaza escalamiento o derivación).
     * 
     * - Si está ESCALADO -> vuelve a ABIERTO (BackOffice rechaza al Agente)
     * - Si está DERIVADO -> vuelve a ESCALADO (Área rechaza al BackOffice)
     * 
     * @param ticketId ID del ticket
     * @param empleadoId ID del empleado que recibe el ticket devuelto
     * @param motivo Motivo de la devolución
     * @return TicketOperationResponse con el resultado
     */
    @Transactional
    public TicketOperationResponse devolverTicket(Long ticketId, Long empleadoId, String motivo) {
        log.info("Devolviendo ticket {} al empleado {}", ticketId, empleadoId);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        if (!transitionValidator.puedeDevolver(ticket.getEstado())) {
            throw new InvalidStateTransitionException(
                    "Solo se pueden devolver tickets en estado ESCALADO o DERIVADO");
        }

        Empleado empleado = empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new EmpleadoNotFoundException(empleadoId));

        // Finalizar asignación actual
        Optional<Asignacion> asignacionActiva = asignacionRepository.findAsignacionActiva(ticketId);
        Asignacion asignacionAnterior = null;
        if (asignacionActiva.isPresent()) {
            asignacionAnterior = asignacionActiva.get();
            asignacionAnterior.setFechaFin(LocalDateTime.now());
            asignacionRepository.save(asignacionAnterior);
        }

        // Crear nueva asignación
        Asignacion nuevaAsignacion = Asignacion.builder()
                .ticket(ticket)
                .empleado(empleado)
                .asignacionPadre(asignacionAnterior)
                .build();
        asignacionRepository.save(nuevaAsignacion);

        // Determinar nuevo estado
        String estadoAnterior = ticket.getEstado().name();
        EstadoTicket nuevoEstado = ticket.getEstado() == EstadoTicket.ESCALADO 
                ? EstadoTicket.ABIERTO 
                : EstadoTicket.ESCALADO;

        ticket.setEstado(nuevoEstado);
        ticketRepository.save(ticket);

        return TicketOperationResponse.builder()
                .ticketId(ticketId)
                .estadoAnterior(estadoAnterior)
                .estadoActual(nuevoEstado.name())
                .operacion("DEVOLVER")
                .fechaOperacion(LocalDateTime.now())
                .mensaje("Ticket devuelto. Motivo: " + motivo)
                .exitoso(true)
                .build();
    }

    // ==================== CERRAR TICKET ====================

    /**
     * Cierra un ticket directamente.
     * Implementa el patrón Observer: al cerrar, crea una encuesta y publica TicketClosedEvent.
     * 
     * @param ticketId ID del ticket
     * @param empleadoId ID del empleado que cierra
     * @return TicketOperationResponse con el resultado
     */
    @Transactional
    public TicketOperationResponse cerrarTicket(Long ticketId, Long empleadoId) {
        log.info("Cerrando ticket {} por empleado {}", ticketId, empleadoId);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        if (!transitionValidator.puedeCerrar(ticket.getEstado())) {
            throw new InvalidStateTransitionException("El ticket ya está cerrado");
        }

        // Finalizar asignación activa
        finalizarAsignacionActiva(ticketId);

        // Cerrar ticket
        String estadoAnterior = ticket.getEstado().name();
        ticket.setEstado(EstadoTicket.CERRADO);
        ticket.setFechaCierre(LocalDateTime.now());
        ticketRepository.save(ticket);

        // ==================== PATRÓN OBSERVER: Crear encuesta y notificar ====================
        Long encuestaId = null;
        try {
            encuestaId = crearEncuestaParaTicket(ticket);
            log.info("Encuesta {} creada para ticket {}", encuestaId, ticketId);
        } catch (Exception ex) {
            log.warn("No se pudo crear encuesta para ticket {}: {}", ticketId, ex.getMessage());
            // No bloqueamos el cierre del ticket si falla la creación de encuesta
        }

        // Publicar evento para que TicketClosedListener envíe el correo
        if (encuestaId != null && ticket.getCliente() != null) {
            eventPublisher.publishEvent(new TicketClosedEvent(
                ticketId, 
                encuestaId, 
                ticket.getCliente().getIdCliente()
            ));
            log.info("TicketClosedEvent publicado: ticketId={}, encuestaId={}, clienteId={}", 
                ticketId, encuestaId, ticket.getCliente().getIdCliente());
        }

        return TicketOperationResponse.builder()
                .ticketId(ticketId)
                .estadoAnterior(estadoAnterior)
                .estadoActual(EstadoTicket.CERRADO.name())
                .operacion("CERRAR")
                .fechaOperacion(LocalDateTime.now())
                .mensaje("Ticket cerrado exitosamente" + (encuestaId != null ? ". Encuesta enviada." : ""))
                .exitoso(true)
                .build();
    }

    /**
     * Crea una encuesta para el ticket cerrado.
     * Busca la primera plantilla vigente y crea la encuesta asociada al ticket, agente y cliente.
     */
    private Long crearEncuestaParaTicket(Ticket ticket) {
        // Buscar plantilla vigente (por defecto la primera disponible)
        PlantillaEncuesta plantilla = plantillaEncuestaRepository.findFirstByVigenteTrue()
            .orElseThrow(() -> new IllegalStateException("No hay plantillas de encuesta vigentes"));

        ClienteEntity cliente = ticket.getCliente();
        if (cliente == null) {
            throw new IllegalStateException("El ticket no tiene cliente asociado");
        }

        // Crear la encuesta usando el servicio
        Encuesta encuesta = encuestaService.crearEncuestaParaTicket(
            plantilla.getIdPlantillaEncuesta(),
            ticket,
            null, // El agente se obtiene de las asignaciones del ticket
            cliente
        );

        return encuesta.getIdEncuesta();
    }

    // ==================== MÉTODOS AUXILIARES ====================

    /**
     * Finaliza la asignación activa de un ticket.
     */
    private void finalizarAsignacionActiva(Long ticketId) {
        Optional<Asignacion> asignacionActiva = asignacionRepository.findAsignacionActiva(ticketId);
        if (asignacionActiva.isPresent()) {
            Asignacion asignacion = asignacionActiva.get();
            asignacion.setFechaFin(LocalDateTime.now());
            asignacionRepository.save(asignacion);
        }
    }
}
