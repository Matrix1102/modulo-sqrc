package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.model.Asignacion;
import com.sqrc.module.backendsqrc.ticket.model.Correo;
import com.sqrc.module.backendsqrc.ticket.model.TipoCorreo;
import com.sqrc.module.backendsqrc.ticket.repository.CorreoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Servicio de email SIMULADO exclusivo para el módulo de Tickets.
 * No requiere configuración SMTP ni internet.
 * Ahora también persiste los correos en la base de datos.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketEmailService {

    private final CorreoRepository correoRepository;

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

    /**
     * Envía un correo HTML y lo PERSISTE en la base de datos.
     * El HTML se convierte a texto plano antes de guardar para mejor legibilidad.
     * VERSIÓN SÍNCRONA para uso dentro de transacciones.
     *
     * @param destinatario Email del destinatario
     * @param asunto Asunto del correo
     * @param cuerpoHtml Contenido HTML del correo
     * @param asignacion Asignación relacionada con el correo
     * @param tipoCorreo Tipo de correo (SOLICITUD_ESCALAMIENTO, RESPUESTA_INTERNA, DERIVACION_EXTERNA)
     */
    public void enviarYGuardarCorreo(String destinatario, String asunto, String cuerpoHtml,
                                      Asignacion asignacion, TipoCorreo tipoCorreo) {
        // 1. Enviar correo (SIMULADO)
        log.info("=================================================");
        log.info("📨 [TICKET EMAIL MOCK] Enviando notificación...");
        log.info("   -> Para: {}", destinatario);
        log.info("   -> Asunto: {}", asunto);
        log.info("   -> Tipo: {}", tipoCorreo);
        log.info("   -> ID Asignación: {}", asignacion.getIdAsignacion());
        log.info("   -> Contenido: {}", cuerpoHtml.substring(0, Math.min(100, cuerpoHtml.length())) + "...");
        log.info("✅ Enviado exitosamente (Simulado)");

        // 2. Guardar en BD (convertir HTML a texto plano)
        String cuerpoTextoPlano = extraerTextoPlano(cuerpoHtml);

        Correo correo = Correo.builder()
                .asignacion(asignacion)
                .asunto(asunto)
                .cuerpo(cuerpoTextoPlano)  // Guarda texto plano sin HTML
                .tipoCorreo(tipoCorreo)
                .fechaEnvio(LocalDateTime.now())
                .build();

        Correo correoGuardado = correoRepository.save(correo);
        log.info("💾 Correo guardado en BD (ID: {}, ID Asignación: {}, Tipo: {})",
                correoGuardado.getIdCorreo(), asignacion.getIdAsignacion(), tipoCorreo);

        log.info("=================================================");
    }

    /**
     * Versión ASÍNCRONA del método enviarYGuardarCorreo.
     * Úsala solo cuando NO estés dentro de una transacción activa.
     */
    @Async
    public void enviarYGuardarCorreoAsync(String destinatario, String asunto, String cuerpoHtml,
                                          Asignacion asignacion, TipoCorreo tipoCorreo) {
        try {
            enviarYGuardarCorreo(destinatario, asunto, cuerpoHtml, asignacion, tipoCorreo);
        } catch (Exception ex) {
            log.error("❌ Error al guardar correo en BD (async): {}", ex.getMessage(), ex);
        }
    }

    /**
     * Extrae el texto plano de un contenido HTML removiendo todas las etiquetas.
     * Conserva saltos de línea y formato básico.
     *
     * @param html Contenido HTML
     * @return Texto plano sin etiquetas HTML
     */
    private String extraerTextoPlano(String html) {
        if (html == null || html.isEmpty()) {
            return "";
        }

        return html
                // Convertir <br>, <p>, <div>, <h1-h6> en saltos de línea
                .replaceAll("(?i)<br\\s*/?>", "\n")
                .replaceAll("(?i)</p>", "\n\n")
                .replaceAll("(?i)</div>", "\n")
                .replaceAll("(?i)</h[1-6]>", "\n\n")
                // Remover todas las etiquetas HTML
                .replaceAll("<[^>]+>", "")
                // Decodificar entidades HTML comunes
                .replace("&nbsp;", " ")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&amp;", "&")
                .replace("&quot;", "\"")
                // Limpiar espacios múltiples y líneas vacías excesivas
                .replaceAll(" +", " ")
                .replaceAll("\n{3,}", "\n\n")
                .trim();
    }
}