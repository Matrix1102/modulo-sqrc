package com.sqrc.module.backendsqrc.ticket.exception;

/**
 * Excepción lanzada cuando no se encuentra un empleado.
 * 
 * Patrón: Custom Exception
 */
public class EmpleadoNotFoundException extends RuntimeException {

    private final Long empleadoId;

    public EmpleadoNotFoundException(Long empleadoId) {
        super("Empleado no encontrado con ID: " + empleadoId);
        this.empleadoId = empleadoId;
    }

    public EmpleadoNotFoundException(String message) {
        super(message);
        this.empleadoId = null;
    }

    public Long getEmpleadoId() {
        return empleadoId;
    }
}
