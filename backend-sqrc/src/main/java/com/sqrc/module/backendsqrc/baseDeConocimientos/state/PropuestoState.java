package com.sqrc.module.backendsqrc.baseDeConocimientos.state;

import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.TransicionEstadoException;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;

/**
 * Estado PROPUESTO: La versión ha sido enviada para revisión del supervisor.
 * 
 * Transiciones válidas:
 * - publicar() → PUBLICADO
 * - rechazar() → RECHAZADO
 * 
 * Características:
 * - No puede ser editada (está en revisión)
 * - No es visible para agentes hasta aprobación
 */
public class PropuestoState implements EstadoArticuloState {

    private static final PropuestoState INSTANCE = new PropuestoState();

    private PropuestoState() {
    }

    public static PropuestoState getInstance() {
        return INSTANCE;
    }

    @Override
    public EstadoArticulo getEstado() {
        return EstadoArticulo.PROPUESTO;
    }

    @Override
    public EstadoArticuloState proponer(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.PROPUESTO,
                EstadoArticulo.PROPUESTO,
                "La versión ya está propuesta para revisión");
    }

    @Override
    public EstadoArticuloState publicar(ArticuloVersion version) {
        // Transición válida: PROPUESTO → PUBLICADO
        version.setEstadoPropuestaInterno(EstadoArticulo.PUBLICADO);
        version.marcarComoVigenteInterno();
        return PublicadoState.getInstance();
    }

    @Override
    public EstadoArticuloState rechazar(ArticuloVersion version) {
        // Transición válida: PROPUESTO → RECHAZADO
        version.setEstadoPropuestaInterno(EstadoArticulo.RECHAZADO);
        return RechazadoState.getInstance();
    }

    @Override
    public EstadoArticuloState archivar(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.PROPUESTO,
                EstadoArticulo.ARCHIVADO,
                "Solo se pueden archivar versiones publicadas");
    }

    @Override
    public EstadoArticuloState deprecar(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.PROPUESTO,
                EstadoArticulo.DEPRECADO,
                "Solo se pueden deprecar versiones publicadas");
    }

    @Override
    public EstadoArticuloState volverABorrador(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.PROPUESTO,
                EstadoArticulo.BORRADOR,
                "Una versión propuesta debe ser aprobada o rechazada, no puede volver a borrador");
    }

    @Override
    public boolean puedeEditar() {
        return false; // Está en revisión
    }

    @Override
    public boolean esVisible() {
        return false; // Pendiente de aprobación
    }
}
