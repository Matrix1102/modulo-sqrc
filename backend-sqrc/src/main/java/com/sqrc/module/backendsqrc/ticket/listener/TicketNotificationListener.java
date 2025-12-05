package com.sqrc.module.backendsqrc.ticket.listener;

import com.sqrc.module.backendsqrc.ticket.service.TicketEmailService;
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

    private final TicketEmailService emailService;

    /**
     * Escucha el evento de ticket escalado.
     * NOTA: El envío de correo ahora se realiza directamente en TicketWorkflowFacade
     * con toda la información del formulario (asunto, problemática, justificación).
     * Este listener solo registra el evento para auditoría futura.
     *
     * @param event Evento con la información del ticket escalado
     */
    @Async
    @EventListener
    public void onTicketEscalado(TicketEscaladoEvent event) {
        System.out.println("🔔 [LISTENER] Evento capturado: Ticket escalado ID " + event.getTicketId());
        // El correo ya se envió y guardó en TicketWorkflowFacade.enviarYGuardarCorreoEscalamiento()
        // Aquí solo registramos el evento para auditoría
        System.out.println("    → Correo de escalamiento ya procesado en el flujo principal");
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

