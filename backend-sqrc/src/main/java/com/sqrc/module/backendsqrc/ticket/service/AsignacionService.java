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

    public AsignacionService(AsignacionRepository repository,
                             EmpleadoRepository empleadoRepository,
                             @Qualifier("leastLoaded") AssignmentStrategy assignmentStrategy) {
        this.repository = repository;
        this.empleadoRepository = empleadoRepository;
        this.assignmentStrategy = assignmentStrategy;
    }

    @Transactional
    public Asignacion reasignarTicket(Ticket ticket, String areaDestino) {
        // 1. Obtener la asignación actual (Será el PADRE)
        Optional<Asignacion> asignacionActualOpt = repository.findAsignacionActiva(ticket.getIdTicket());
        Asignacion asignacionPadre = null;

        if (asignacionActualOpt.isPresent()) {
            asignacionPadre = asignacionActualOpt.get();
            // Cerrar la anterior
            asignacionPadre.setFechaFin(LocalDateTime.now());
            repository.save(asignacionPadre);
            System.out.println("🔒 [ASIGNACION] Asignación anterior cerrada (ID: " + asignacionPadre.getIdAsignacion() + ")");
        }

        // 2. Usar STRATEGY para elegir al "Elegido" del Backoffice
        Long nuevoResponsableId = assignmentStrategy.findBestAgentId(areaDestino);

        // 3. Buscar el empleado por ID
        Empleado empleado = empleadoRepository.findById(nuevoResponsableId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado con ID: " + nuevoResponsableId));

        // 4. Crear la nueva asignación CON PADRE
        Asignacion nueva = Asignacion.builder()
                .ticket(ticket)
                .empleado(empleado)
                .asignacionPadre(asignacionPadre) // <--- ¡AQUÍ ESTÁ LA VINCULACIÓN!
                .fechaInicio(LocalDateTime.now())
                .build();

        nueva = repository.save(nueva);

        System.out.println("✅ [ASIGNACION] Ticket " + ticket.getIdTicket() + " movido al agente ID: " + nuevoResponsableId);

        return nueva; // Retornar la asignación creada
    }
}