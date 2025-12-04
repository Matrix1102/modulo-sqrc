package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.model.Asignacion;
import com.sqrc.module.backendsqrc.ticket.model.Documentacion;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.repository.AsignacionRepository;
import com.sqrc.module.backendsqrc.ticket.repository.DocumentacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio para gestionar la documentación de escalamientos.
 * Registra el problema y la justificación cuando un ticket es escalado.
 */
@Service
@RequiredArgsConstructor
public class DocumentacionService {

    private final DocumentacionRepository documentacionRepository;
    private final AsignacionRepository asignacionRepository;

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
                .build();

        documentacionRepository.save(documentacion);

        System.out.println("📝 [DOCUMENTACION] Escalamiento registrado para Ticket ID: " + ticket.getIdTicket());
        System.out.println("    → Problema: " + problema);
        System.out.println("    → Justificación: " + justificacion);
    }
}

