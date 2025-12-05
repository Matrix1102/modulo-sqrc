package com.sqrc.module.backendsqrc.baseDeConocimientos.state;

import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.TransicionEstadoException;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;

/**
 * Estado ARCHIVADO: La versión fue reemplazada por una nueva versión.
 * 
 * Transiciones válidas:
 * - Ninguna (estado terminal)
 * 
 * Características:
 * - No puede ser editada
 * - No es visible para agentes (solo para historial)
 * - Es un estado terminal del ciclo de vida
 */
public class ArchivadoState implements EstadoArticuloState {

    private static final ArchivadoState INSTANCE = new ArchivadoState();

    private ArchivadoState() {}

    public static ArchivadoState getInstance() {
        return INSTANCE;
    }

    @Override
    public EstadoArticulo getEstado() {
        return EstadoArticulo.ARCHIVADO;
    }

    @Override
    public EstadoArticuloState proponer(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.ARCHIVADO, 
            EstadoArticulo.PROPUESTO,
            "Una versión archivada no puede ser modificada. Cree una nueva versión."
        );
    }

    @Override
    public EstadoArticuloState publicar(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.ARCHIVADO, 
            EstadoArticulo.PUBLICADO,
            "Una versión archivada no puede ser republicada. Cree una nueva versión."
        );
    }

    @Override
    public EstadoArticuloState rechazar(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.ARCHIVADO, 
            EstadoArticulo.RECHAZADO,
            "Una versión archivada no puede ser rechazada"
        );
    }

    @Override
    public EstadoArticuloState archivar(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.ARCHIVADO, 
            EstadoArticulo.ARCHIVADO,
            "La versión ya está archivada"
        );
    }

    @Override
    public EstadoArticuloState deprecar(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.ARCHIVADO, 
            EstadoArticulo.DEPRECADO,
            "Una versión archivada no puede ser deprecada"
        );
    }

    @Override
    public EstadoArticuloState volverABorrador(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.ARCHIVADO, 
            EstadoArticulo.BORRADOR,
            "Una versión archivada no puede volver a borrador. Cree una nueva versión."
        );
    }

    @Override
    public boolean puedeEditar() {
        return false;
    }

    @Override
    public boolean esVisible() {
        return false; // Solo para historial
    }
}
