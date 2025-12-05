package com.sqrc.module.backendsqrc.baseDeConocimientos.exception;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;

/**
 * Excepción lanzada cuando se intenta realizar una transición de estado no
 * válida.
 */
public class TransicionEstadoException extends RuntimeException {

    private final EstadoArticulo estadoActual;
    private final EstadoArticulo estadoDestino;

    public TransicionEstadoException(EstadoArticulo estadoActual, EstadoArticulo estadoDestino, String mensaje) {
        super(String.format("Transición no permitida de %s a %s: %s",
                estadoActual, estadoDestino, mensaje));
        this.estadoActual = estadoActual;
        this.estadoDestino = estadoDestino;
    }

    public TransicionEstadoException(EstadoArticulo estadoActual, EstadoArticulo estadoDestino) {
        super(String.format("Transición no permitida de %s a %s", estadoActual, estadoDestino));
        this.estadoActual = estadoActual;
        this.estadoDestino = estadoDestino;
    }

    public EstadoArticulo getEstadoActual() {
        return estadoActual;
    }

    public EstadoArticulo getEstadoDestino() {
        return estadoDestino;
    }
}
