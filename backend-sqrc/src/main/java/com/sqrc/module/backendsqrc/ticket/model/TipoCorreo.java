package com.sqrc.module.backendsqrc.ticket.model;

/**
 * Enum que define los tipos de correo que se pueden enviar en el sistema de tickets.
 */
public enum TipoCorreo {
    /**
     * Correo enviado cuando un agente escala un ticket al BackOffice
     */
    SOLICITUD_ESCALAMIENTO,

    /**
     * Correo enviado como respuesta interna entre empleados
     */
    RESPUESTA_INTERNA,

    /**
     * Correo enviado cuando se deriva un ticket a un área externa
     */
    DERIVACION_EXTERNA
}

