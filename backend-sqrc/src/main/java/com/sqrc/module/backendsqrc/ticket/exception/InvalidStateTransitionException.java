package com.sqrc.module.backendsqrc.ticket.exception;

import com.sqrc.module.backendsqrc.ticket.model.EstadoTicket;

/**
 * Excepción lanzada cuando se intenta una transición de estado inválida.
 * 
 * Patrón: Custom Exception + Strategy Pattern (valida con reglas de negocio)
 * 
 * Transiciones válidas según reglas de negocio:
 * - ABIERTO -> ESCALADO (Agente escala a BackOffice)
 * - ABIERTO -> CERRADO (Agente resuelve directamente)
 * - ESCALADO -> DERIVADO (BackOffice deriva a área especializada)
 * - ESCALADO -> ABIERTO (BackOffice rechaza y devuelve a Agente)
 * - ESCALADO -> CERRADO (BackOffice resuelve)
 * - DERIVADO -> CERRADO (Área especializada resuelve)
 */
public class InvalidStateTransitionException extends RuntimeException {

    private final EstadoTicket estadoActual;
    private final EstadoTicket estadoSolicitado;

    public InvalidStateTransitionException(EstadoTicket estadoActual, EstadoTicket estadoSolicitado) {
        super(String.format("Transición de estado inválida: %s -> %s", estadoActual, estadoSolicitado));
        this.estadoActual = estadoActual;
        this.estadoSolicitado = estadoSolicitado;
    }

    public InvalidStateTransitionException(String message) {
        super(message);
        this.estadoActual = null;
        this.estadoSolicitado = null;
    }

    public EstadoTicket getEstadoActual() {
        return estadoActual;
    }

    public EstadoTicket getEstadoSolicitado() {
        return estadoSolicitado;
    }
}
