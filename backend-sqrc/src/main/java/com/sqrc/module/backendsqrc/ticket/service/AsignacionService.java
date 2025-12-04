package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.model.Asignacion;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.repository.AsignacionRepository;
import com.sqrc.module.backendsqrc.ticket.repository.EmpleadoRepository;
import com.sqrc.module.backendsqrc.ticket.strategy.AssignmentStrategy;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AsignacionService {

    private final AsignacionRepository repository;
    private final EmpleadoRepository empleadoRepository;
    private final AssignmentStrategy assignmentStrategy;

    // Inyectamos la estrategia específica ("leastLoaded" es el nombre que le pusimos al componente)
    public AsignacionService(AsignacionRepository repository,
                             EmpleadoRepository empleadoRepository,
                             @Qualifier("leastLoaded") AssignmentStrategy assignmentStrategy) {
        this.repository = repository;
        this.empleadoRepository = empleadoRepository;
        this.assignmentStrategy = assignmentStrategy;
    }

    @Transactional
    public void reasignarTicket(Ticket ticket, String areaDestino) {
        // 1. Cerrar la asignación actual (si existe)
        cerrarAsignacionActual(ticket);

        // 2. Usar STRATEGY para elegir al "Elegido" del Backoffice
        Long nuevoResponsableId = assignmentStrategy.findBestAgentId(areaDestino);

        // 3. Buscar el empleado por ID
        Empleado empleado = empleadoRepository.findById(nuevoResponsableId)
                .orElseThrow(() -> new RuntimeException(
                        "Empleado no encontrado con ID: " + nuevoResponsableId
                ));

        // 4. Crear la nueva asignación
        Asignacion nueva = Asignacion.builder()
                .ticket(ticket)
                .empleado(empleado)
                .fechaInicio(LocalDateTime.now())
                .build();

        repository.save(nueva);

        System.out.println("✅ [ASIGNACION] Ticket " + ticket.getIdTicket() + " movido al agente ID: " + nuevoResponsableId);
    }

    // Método auxiliar para cerrar la asignación actual
    private void cerrarAsignacionActual(Ticket ticket) {
        Optional<Asignacion> asignacionActiva = repository.findAsignacionActiva(ticket.getIdTicket());

        if (asignacionActiva.isPresent()) {
            Asignacion asignacion = asignacionActiva.get();
            asignacion.setFechaFin(LocalDateTime.now());
            repository.save(asignacion);
            System.out.println("🔒 [ASIGNACION] Asignación anterior cerrada para Ticket ID: " + ticket.getIdTicket());
        }
    }
}