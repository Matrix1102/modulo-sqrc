package com.sqrc.module.backendsqrc.ticket.exception;

/**
 * Excepción lanzada cuando se intenta asignar un ticket que ya tiene asignación activa.
 * 
 * Patrón: Custom Exception
 */
public class TicketAlreadyAssignedException extends RuntimeException {

    private final Long ticketId;
    private final Long empleadoActualId;

    public TicketAlreadyAssignedException(Long ticketId, Long empleadoActualId) {
        super(String.format("El ticket %d ya está asignado al empleado %d", ticketId, empleadoActualId));
        this.ticketId = ticketId;
        this.empleadoActualId = empleadoActualId;
    }

    public TicketAlreadyAssignedException(String message) {
        super(message);
        this.ticketId = null;
        this.empleadoActualId = null;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public Long getEmpleadoActualId() {
        return empleadoActualId;
    }
}
