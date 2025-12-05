package com.sqrc.module.backendsqrc.baseDeConocimientos.state;

import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.TransicionEstadoException;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;

/**
 * Estado RECHAZADO: La versión fue rechazada por el supervisor.
 * 
 * Transiciones válidas:
 * - volverABorrador() → BORRADOR (para crear una nueva versión corregida)
 * 
 * Características:
 * - No puede ser editada directamente
 * - No es visible para agentes
 * - El autor puede crear una nueva versión basada en el feedback
 */
public class RechazadoState implements EstadoArticuloState {

    private static final RechazadoState INSTANCE = new RechazadoState();

    private RechazadoState() {}

    public static RechazadoState getInstance() {
        return INSTANCE;
    }

    @Override
    public EstadoArticulo getEstado() {
        return EstadoArticulo.RECHAZADO;
    }

    @Override
    public EstadoArticuloState proponer(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.RECHAZADO, 
            EstadoArticulo.PROPUESTO,
            "Una versión rechazada no puede ser propuesta nuevamente. Cree una nueva versión."
        );
    }

    @Override
    public EstadoArticuloState publicar(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.RECHAZADO, 
            EstadoArticulo.PUBLICADO,
            "Una versión rechazada no puede ser publicada. Cree una nueva versión."
        );
    }

    @Override
    public EstadoArticuloState rechazar(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.RECHAZADO, 
            EstadoArticulo.RECHAZADO,
            "La versión ya está rechazada"
        );
    }

    @Override
    public EstadoArticuloState archivar(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.RECHAZADO, 
            EstadoArticulo.ARCHIVADO,
            "Una versión rechazada no puede ser archivada"
        );
    }

    @Override
    public EstadoArticuloState deprecar(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.RECHAZADO, 
            EstadoArticulo.DEPRECADO,
            "Una versión rechazada no puede ser deprecada"
        );
    }

    @Override
    public EstadoArticuloState volverABorrador(ArticuloVersion version) {
        // Transición válida: RECHAZADO → BORRADOR
        // Nota: En la práctica, esto significa crear una nueva versión
        version.setEstadoPropuestaInterno(EstadoArticulo.BORRADOR);
        return BorradorState.getInstance();
    }

    @Override
    public boolean puedeEditar() {
        return false; // Debe crear nueva versión
    }

    @Override
    public boolean esVisible() {
        return false;
    }
}
