package com.sqrc.module.backendsqrc.ticket.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TicketDerivadoEvent extends ApplicationEvent {

    private final Long ticketId;
    private final String destinatarioEmail; // Útil para logs rápidos

    public TicketDerivadoEvent(Object source, Long ticketId, String destinatarioEmail) {
        super(source);
        this.ticketId = ticketId;
        this.destinatarioEmail = destinatarioEmail;
    }
}