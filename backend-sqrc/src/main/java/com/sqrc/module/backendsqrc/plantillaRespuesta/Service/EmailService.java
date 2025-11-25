package com.sqrc.module.backendsqrc.plantillaRespuesta.Service;


import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender; // (1) El Cartero de Spring

    /**
     * Envía un correo HTML con un PDF adjunto.
     */
    public void enviarCorreoConAdjunto(String destinatario, String asunto, String cuerpoHtml, byte[] pdfBytes, String nombreArchivoPdf) {

        try {
            // 1. Crear un mensaje complejo (MimeMessage)
            MimeMessage message = mailSender.createMimeMessage();

            // 2. Usar el Helper (Ayudante) para configurar todo fácil
            // true = MULTIPART (Significa que lleva adjuntos)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("tu_correo@gmail.com"); // Quién lo envía
            helper.setTo(destinatario);            // A quién le llega
            helper.setSubject(asunto);             // El título
            helper.setText(cuerpoHtml, true);      // true = El cuerpo es HTML, no texto plano

            // 3. ADJUNTAR EL PDF
            // Aquí ocurre la magia: Convertimos los bytes del PDF en un recurso adjuntable
            // sin guardarlo en el disco duro.
            ByteArrayResource pdfResource = new ByteArrayResource(pdfBytes);

            helper.addAttachment(nombreArchivoPdf, pdfResource);

            // 4. Enviar
            mailSender.send(message);
            System.out.println("Correo enviado con éxito a: " + destinatario);

        } catch (MessagingException e) {
            // Error típico: Credenciales mal, internet caído, correo inválido.
            throw new RuntimeException("Error al enviar el correo: " + e.getMessage(), e);
        }
    }

}
