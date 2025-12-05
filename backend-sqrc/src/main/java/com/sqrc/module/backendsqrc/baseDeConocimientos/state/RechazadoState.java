package com.sqrc.module.backendsqrc.baseDeConocimientos.state;

import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.TransicionEstadoException;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;

/**
 * Estado RECHAZADO: La versión fue rechazada por el supervisor.
 * 
 * Transiciones válidas:
 * - proponer() → PROPUESTO (re-proponer para revisión)
 * - volverABorrador() → BORRADOR (para crear una nueva versión corregida)
 * 
 * Características:
 * - No puede ser editada directamente
 * - No es visible para agentes
 * - El autor puede re-proponer o crear una nueva versión
 */
public class RechazadoState implements EstadoArticuloState {

    private static final RechazadoState INSTANCE = new RechazadoState();

    private RechazadoState() {
    }

    public static RechazadoState getInstance() {
        return INSTANCE;
    }

    @Override
    public EstadoArticulo getEstado() {
        return EstadoArticulo.RECHAZADO;
    }

    @Override
    public EstadoArticuloState proponer(ArticuloVersion version) {
        // Transición válida: RECHAZADO → PROPUESTO (re-proponer)
        version.setEstadoPropuestaInterno(EstadoArticulo.PROPUESTO);
        return PropuestoState.getInstance();
    }

    @Override
    public EstadoArticuloState publicar(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.RECHAZADO,
                EstadoArticulo.PUBLICADO,
                "Una versión rechazada no puede ser publicada directamente. Debe ser propuesta primero.");
    }

    @Override
    public EstadoArticuloState rechazar(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.RECHAZADO,
                EstadoArticulo.RECHAZADO,
                "La versión ya está rechazada");
    }

    @Override
    public EstadoArticuloState archivar(ArticuloVersion version) {
        // Transición válida: RECHAZADO → ARCHIVADO
        version.setEstadoPropuestaInterno(EstadoArticulo.ARCHIVADO);
        return ArchivadoState.getInstance();
    }

    @Override
    public EstadoArticuloState deprecar(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.RECHAZADO,
                EstadoArticulo.DEPRECADO,
                "Una versión rechazada no puede ser deprecada");
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
