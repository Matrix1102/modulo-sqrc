package com.sqrc.module.backendsqrc.logs.model;

/**
 * Categorías de logs para clasificar las operaciones de auditoría.
 */
public enum LogCategory {
    /** Operaciones relacionadas con clientes en Vista 360 */
    CLIENTE,
    
    /** Operaciones de gestión de tickets */
    TICKET,
    
    /** Operaciones del flujo de trabajo de tickets (escalar, derivar, etc.) */
    TICKET_WORKFLOW,
    
    /** Operaciones de encuestas */
    ENCUESTA,
    
    /** Operaciones de la base de conocimientos */
    ARTICULO,
    
    /** Consultas de reportes y dashboards */
    REPORTE,
    
    /** Autenticación y acceso */
    AUTH,
    
    /** Errores y excepciones */
    ERROR,
    
    /** Comunicaciones (correos, notificaciones) */
    COMUNICACION,
    
    /** Integración con servicios externos */
    INTEGRACION
}
