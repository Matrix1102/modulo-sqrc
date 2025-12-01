package com.sqrc.module.backendsqrc.baseDeConocimientos.model;

/**
 * Estados posibles para un artículo de la base de conocimientos.
 * Representa el ciclo de vida de una versión de artículo.
 */
public enum EstadoArticulo {
    BORRADOR, // Versión en edición, no visible para agentes
    PUBLICADO, // Versión activa y visible según su visibilidad
    ARCHIVADO, // Versión anterior, ya no vigente
    RECHAZADO // Versión rechazada por el supervisor
}
