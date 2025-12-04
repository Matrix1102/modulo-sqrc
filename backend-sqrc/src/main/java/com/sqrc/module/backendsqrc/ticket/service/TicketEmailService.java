package com.sqrc.module.backendsqrc.ticket.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Servicio de email SIMULADO exclusivo para el módulo de Tickets.
 * No requiere configuración SMTP ni internet.
 */
@Service
@Slf4j
public class TicketEmailService {

    @Async
    public void enviarNotificacion(String destinatario, String asunto, String cuerpoHtml) {
        log.info("=================================================");
        log.info("📨 [TICKET EMAIL MOCK] Enviando notificación...");
        log.info("   -> Para: {}", destinatario);
        log.info("   -> Asunto: {}", asunto);
        log.info("   -> Contenido: {}", cuerpoHtml);
        log.info("✅ Enviado exitosamente (Simulado)");
        log.info("=================================================");
    }

    /**
     * Envía un correo HTML de forma asíncrona (SIMULADO).
     * Alias del método enviarNotificacion para compatibilidad.
     *
     * @param destinatario Email del destinatario
     * @param asunto Asunto del correo
     * @param cuerpoHtml Contenido HTML del correo
     */
    @Async
    public void enviarCorreoHtmlAsync(String destinatario, String asunto, String cuerpoHtml) {
        enviarNotificacion(destinatario, asunto, cuerpoHtml);
    }
}