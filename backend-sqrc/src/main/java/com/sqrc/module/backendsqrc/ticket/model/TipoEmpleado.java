package com.sqrc.module.backendsqrc.ticket.model;

/**
 * Enum que define los tipos de empleado en el sistema.
 * Se usa como discriminador en la herencia de Empleado.
 */
public enum TipoEmpleado {
    SUPERVISOR,
    BACKOFFICE,
    AGENTE_LLAMADA,
    AGENTE_PRESENCIAL,
    /**
     * Tipo genérico para empleados sincronizados desde API externa.
     * Corresponde al DiscriminatorValue por defecto de la clase base Empleado.
     */
    AGENTE
}
