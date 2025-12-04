package com.sqrc.module.backendsqrc.ticket.listener;

import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.EmailService;
import com.sqrc.module.backendsqrc.ticket.event.TicketDerivadoEvent;
import com.sqrc.module.backendsqrc.ticket.event.TicketEscaladoEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Listener que reacciona a eventos de tickets (Observer Pattern).
 * Envía notificaciones por correo cuando se escala o deriva un ticket.
 */
@Component
@RequiredArgsConstructor
public class TicketNotificationListener {

    private final EmailService emailService;

    /**
     * Escucha el evento de ticket escalado.
     * Notifica al jefe de soporte sobre el escalamiento.
     *
     * @param event Evento con la información del ticket escalado
     */
    @Async
    @EventListener
    public void onTicketEscalado(TicketEscaladoEvent event) {
        System.out.println("🔔 [LISTENER] Evento capturado: Ticket escalado ID " + event.getTicketId());

        // Simulación: Enviar correo al jefe de soporte
        String destinatario = "jefe.soporte@empresa.com";
        String asunto = "⚠️ Ticket #" + event.getTicketId() + " escalado a Backoffice";
        String cuerpoHtml = """
                <html>
                <body>
                    <h2>Notificación de Escalamiento</h2>
                    <p>El Ticket <strong>#%d</strong> ha sido escalado al área de Backoffice.</p>
                    <p>Se requiere atención de nivel superior.</p>
                    <br/>
                    <p><em>Sistema de Gestión de Tickets SQRC</em></p>
                </body>
                </html>
                """.formatted(event.getTicketId());

        emailService.enviarCorreoHtmlAsync(destinatario, asunto, cuerpoHtml);

        System.out.println("    → Correo de escalamiento enviado a: " + destinatario);
    }

    /**
     * Escucha el evento de ticket derivado.
     * Notifica al área externa sobre la derivación.
     *
     * @param event Evento con la información del ticket derivado
     */
    @Async
    @EventListener
    public void onTicketDerivado(TicketDerivadoEvent event) {
        System.out.println("🔔 [LISTENER] Evento capturado: Ticket derivado ID " + event.getTicketId());

        // Enviar correo al área externa
        String destinatario = event.getDestinatarioEmail();
        String asunto = "📨 Ticket #" + event.getTicketId() + " derivado a su área";
        String cuerpoHtml = """
                <html>
                <body>
                    <h2>Ticket Derivado</h2>
                    <p>Se ha derivado el Ticket <strong>#%d</strong> a su área para gestión.</p>
                    <p>Por favor, revise el caso y proporcione una respuesta.</p>
                    <br/>
                    <p><em>Sistema de Gestión de Tickets SQRC</em></p>
                </body>
                </html>
                """.formatted(event.getTicketId());

        emailService.enviarCorreoHtmlAsync(destinatario, asunto, cuerpoHtml);

        System.out.println("    → Correo de derivación enviado a: " + destinatario);
    }
}

