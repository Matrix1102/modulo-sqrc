package com.sqrc.module.backendsqrc.ticket.exception;

/**
 * Excepción lanzada cuando no se encuentra una asignación.
 * 
 * Patrón: Custom Exception
 */
public class AsignacionNotFoundException extends RuntimeException {

    private final Long asignacionId;

    public AsignacionNotFoundException(Long asignacionId) {
        super("Asignación no encontrada con ID: " + asignacionId);
        this.asignacionId = asignacionId;
    }

    public AsignacionNotFoundException(String message) {
        super(message);
        this.asignacionId = null;
    }

    public Long getAsignacionId() {
        return asignacionId;
    }
}
