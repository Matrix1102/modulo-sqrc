package com.sqrc.module.backendsqrc.ticket.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TicketEscaladoEvent extends ApplicationEvent {

    private final Long ticketId;

    // Puedes agregar más datos si quieres que el Listener no tenga que consultar la BD
    // private final String nombreAgenteAnterior;

    public TicketEscaladoEvent(Object source, Long ticketId) {
        super(source); // 'source' es quién lanzó el evento (el Facade)
        this.ticketId = ticketId;
    }
}