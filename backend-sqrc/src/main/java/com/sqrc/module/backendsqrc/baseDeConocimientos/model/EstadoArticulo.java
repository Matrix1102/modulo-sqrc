package com.sqrc.module.backendsqrc.baseDeConocimientos.model;

/**
 * Estados posibles para un artículo de la base de conocimientos.
 * Representa el ciclo de vida de una versión de artículo.
 */
public enum EstadoArticulo {
    BORRADOR,   // Versión en edición, no visible para agentes
    PROPUESTO,  // Versión propuesta por agente, pendiente de aprobación del supervisor
    PUBLICADO,  // Versión activa y visible según su visibilidad
    ARCHIVADO,  // Versión anterior, ya no vigente
    DEPRECADO,  // Versión que ha expirado (vigenteHasta < ahora)
    RECHAZADO   // Versión rechazada por el supervisor
}
