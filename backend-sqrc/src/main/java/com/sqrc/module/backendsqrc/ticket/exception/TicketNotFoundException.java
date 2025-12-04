package com.sqrc.module.backendsqrc.ticket.exception;

/**
 * Excepción lanzada cuando no se encuentra un ticket.
 * 
 * Patrón: Custom Exception
 */
public class TicketNotFoundException extends RuntimeException {

    private final Long ticketId;

    public TicketNotFoundException(Long ticketId) {
        super("Ticket no encontrado con ID: " + ticketId);
        this.ticketId = ticketId;
    }

    public TicketNotFoundException(String message) {
        super(message);
        this.ticketId = null;
    }

    public Long getTicketId() {
        return ticketId;
    }
}
