package com.sqrc.module.backendsqrc.plantillaRespuesta.model;

/**
 * Enum que define el tipo de respuesta enviada al cliente.
 * Permite diferenciar entre respuestas manuales del agente y automáticas del sistema.
 */
public enum TipoRespuesta {
    /**
     * Respuesta manual enviada por un agente.
     * Requiere intervención humana y representa una respuesta real al caso.
     */
    MANUAL,

    /**
     * Respuesta automática generada por el sistema.
     * Ejemplos: confirmación de registro, notificaciones automáticas.
     */
    AUTOMATICA
}
