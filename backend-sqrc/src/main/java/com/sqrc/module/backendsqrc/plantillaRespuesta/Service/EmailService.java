package com.sqrc.module.backendsqrc.plantillaRespuesta.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    // Leemos el correo configurado en application.properties para usarlo como remitente
    @Value("${spring.mail.username}")
    private String remitente;

    /**
     * Envía un correo HTML, opcionalmente con un PDF adjunto.
     * Se ejecuta en un hilo separado (@Async) para no bloquear al usuario.
     * * @param destinatario Email del cliente
     * @param asunto Título del correo
     * @param cuerpoHtml Contenido en formato HTML
     * @param pdfBytes (Opcional) Array de bytes del PDF. Si es null o vacío, se envía sin adjunto.
     * @param nombreArchivoPdf (Opcional) Nombre del archivo (ej: "Constancia.pdf")
     */
    @Async
    public void enviarCorreoConAdjunto(String destinatario, String asunto, String cuerpoHtml, byte[] pdfBytes, String nombreArchivoPdf) {

        log.info("Iniciando proceso de envío de correo a: {}", destinatario);
        log.debug("Asunto: {}", asunto);

        try {
            // 1. Crear el mensaje
            MimeMessage message = mailSender.createMimeMessage();

            // 2. Configurar Helper (Multipart = true permite adjuntos)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(remitente);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true); // true = Interpretar como HTML

            // 3. Adjuntar PDF (Solo si enviaron bytes válidos)
            if (pdfBytes != null && pdfBytes.length > 0) {
                ByteArrayResource pdfResource = new ByteArrayResource(pdfBytes);
                // Si no enviaron nombre, ponemos uno por defecto
                String nombreFinal = (nombreArchivoPdf != null && !nombreArchivoPdf.isEmpty())
                        ? nombreArchivoPdf
                        : "documento.pdf";

                helper.addAttachment(nombreFinal, pdfResource);
                log.debug("PDF adjuntado: {} ({} bytes)", nombreFinal, pdfBytes.length);
            }

            // 4. Enviar
            mailSender.send(message);
            log.info(" Correo enviado exitosamente a {}", destinatario);

        } catch (MessagingException e) {
            log.error("Error crítico enviando correo a {}", destinatario, e);
            // No lanzamos excepción aquí para no romper el hilo asíncrono, solo lo registramos en el log.
        }
    }

    /**
     * Envía un correo HTML sin adjuntos.
     * Se ejecuta en un hilo separado (@Async) para no bloquear al usuario.
     *
     * @param destinatario Email del destinatario
     * @param asunto Título del correo
     * @param cuerpoHtml Contenido en formato HTML
     */
    @Async
    public void enviarCorreoHtmlAsync(String destinatario, String asunto, String cuerpoHtml) {
        enviarCorreoConAdjunto(destinatario, asunto, cuerpoHtml, null, null);
    }
}