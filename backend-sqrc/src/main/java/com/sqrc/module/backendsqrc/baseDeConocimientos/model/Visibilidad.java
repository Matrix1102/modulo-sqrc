package com.sqrc.module.backendsqrc.baseDeConocimientos.model;

/**
 * Define quién puede ver el artículo de conocimiento.
 */
public enum Visibilidad {
    AGENTE, // Visible para agentes y supervisores
    SUPERVISOR // Solo visible para supervisores
}
