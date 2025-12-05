package com.sqrc.module.backendsqrc.baseDeConocimientos.state;

import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.TransicionEstadoException;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;

/**
 * Estado BORRADOR: La versión está en edición y no es visible para agentes.
 * 
 * Transiciones válidas:
 * - proponer() → PROPUESTO
 * 
 * Características:
 * - Puede ser editada
 * - No es visible para agentes
 */
public class BorradorState implements EstadoArticuloState {

    private static final BorradorState INSTANCE = new BorradorState();

    private BorradorState() {
    }

    public static BorradorState getInstance() {
        return INSTANCE;
    }

    @Override
    public EstadoArticulo getEstado() {
        return EstadoArticulo.BORRADOR;
    }

    @Override
    public EstadoArticuloState proponer(ArticuloVersion version) {
        // Transición válida: BORRADOR → PROPUESTO
        version.setEstadoPropuestaInterno(EstadoArticulo.PROPUESTO);
        return PropuestoState.getInstance();
    }

    @Override
    public EstadoArticuloState publicar(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.BORRADOR,
                EstadoArticulo.PUBLICADO,
                "Una versión en borrador debe ser propuesta primero antes de publicar");
    }

    @Override
    public EstadoArticuloState rechazar(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.BORRADOR,
                EstadoArticulo.RECHAZADO,
                "Solo se pueden rechazar versiones propuestas");
    }

    @Override
    public EstadoArticuloState archivar(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.BORRADOR,
                EstadoArticulo.ARCHIVADO,
                "Solo se pueden archivar versiones publicadas");
    }

    @Override
    public EstadoArticuloState deprecar(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.BORRADOR,
                EstadoArticulo.DEPRECADO,
                "Solo se pueden deprecar versiones publicadas");
    }

    @Override
    public EstadoArticuloState volverABorrador(ArticuloVersion version) {
        // Ya está en borrador
        return this;
    }

    @Override
    public boolean puedeEditar() {
        return true;
    }

    @Override
    public boolean esVisible() {
        return false;
    }
}
