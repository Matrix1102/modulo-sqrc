package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.dto.DerivarRequestDTO;
import com.sqrc.module.backendsqrc.ticket.model.NotificacionExterna;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.repository.NotificacionExternaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio para gestionar la derivación de tickets a áreas externas.
 * Registra las notificaciones de salida y entrada de información.
 */
@Service
@RequiredArgsConstructor
public class DerivacionService {

    private final NotificacionExternaRepository notificacionExternaRepository;

    /**
     * Registra la salida de un ticket hacia un área externa.
     * Simula el envío de correo electrónico al área destino.
     *
     * @param ticket El ticket que se está derivando
     * @param datos DTO con la información de la derivación
     */
    @Transactional
    public void registrarSalida(Ticket ticket, DerivarRequestDTO datos) {
        // Simular el email destino basado en el área
        String emailDestino = "area." + datos.getAreaDestinoId() + "@externo.com";

        // Crear y guardar la notificación externa
        NotificacionExterna notificacion = NotificacionExterna.builder()
                .ticket(ticket)
                .areaDestinoId(datos.getAreaDestinoId())
                .asunto(datos.getAsunto())
                .cuerpo(datos.getCuerpo())
                .destinatarioEmail(emailDestino)
                .build();

        notificacionExternaRepository.save(notificacion);

        System.out.println("📤 [DERIVACION] Ticket ID: " + ticket.getIdTicket() + " derivado al área externa");
        System.out.println("    → Área Destino ID: " + datos.getAreaDestinoId());
        System.out.println("    → Email Destino: " + emailDestino);
        System.out.println("    → Asunto: " + datos.getAsunto());
    }

    /**
     * Registra la entrada de una respuesta desde un área externa.
     * Por ahora solo simula el registro mediante log en consola.
     *
     * @param ticket El ticket que recibe la respuesta
     * @param respuestaExterna Contenido de la respuesta recibida
     */
    @Transactional
    public void registrarEntrada(Ticket ticket, String respuestaExterna) {
        // Simulación: Imprimir en consola que se recibió respuesta
        System.out.println("📥 [DERIVACION] Respuesta recibida de área externa (TI/Ventas)");
        System.out.println("    → Ticket ID: " + ticket.getIdTicket());
        System.out.println("    → Respuesta: " + respuestaExterna);

        // Aquí podrías guardar en una tabla de historial si lo necesitas en el futuro
        // Por ejemplo: HistorialRespuestaRepository.save(...)
    }
}

