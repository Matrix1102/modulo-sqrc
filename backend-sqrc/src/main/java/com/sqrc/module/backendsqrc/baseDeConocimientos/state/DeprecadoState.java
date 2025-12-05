package com.sqrc.module.backendsqrc.baseDeConocimientos.state;

import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.TransicionEstadoException;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;

/**
 * Estado DEPRECADO: La versión ha expirado (vigenteHasta < fecha actual).
 * 
 * Transiciones válidas:
 * - Ninguna (estado terminal)
 * 
 * Características:
 * - No puede ser editada
 * - No es visible para agentes
 * - Es un estado terminal indicando que el contenido ya no es válido
 */
public class DeprecadoState implements EstadoArticuloState {

    private static final DeprecadoState INSTANCE = new DeprecadoState();

    private DeprecadoState() {}

    public static DeprecadoState getInstance() {
        return INSTANCE;
    }

    @Override
    public EstadoArticulo getEstado() {
        return EstadoArticulo.DEPRECADO;
    }

    @Override
    public EstadoArticuloState proponer(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.DEPRECADO, 
            EstadoArticulo.PROPUESTO,
            "Una versión deprecada no puede ser modificada. Cree una nueva versión actualizada."
        );
    }

    @Override
    public EstadoArticuloState publicar(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.DEPRECADO, 
            EstadoArticulo.PUBLICADO,
            "Una versión deprecada no puede ser republicada. Cree una nueva versión."
        );
    }

    @Override
    public EstadoArticuloState rechazar(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.DEPRECADO, 
            EstadoArticulo.RECHAZADO,
            "Una versión deprecada no puede ser rechazada"
        );
    }

    @Override
    public EstadoArticuloState archivar(ArticuloVersion version) {
        // Permitir archivar una versión deprecada (limpiar)
        version.setEstadoPropuestaInterno(EstadoArticulo.ARCHIVADO);
        return ArchivadoState.getInstance();
    }

    @Override
    public EstadoArticuloState deprecar(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.DEPRECADO, 
            EstadoArticulo.DEPRECADO,
            "La versión ya está deprecada"
        );
    }

    @Override
    public EstadoArticuloState volverABorrador(ArticuloVersion version) {
        throw new TransicionEstadoException(
            EstadoArticulo.DEPRECADO, 
            EstadoArticulo.BORRADOR,
            "Una versión deprecada no puede volver a borrador. Cree una nueva versión."
        );
    }

    @Override
    public boolean puedeEditar() {
        return false;
    }

    @Override
    public boolean esVisible() {
        return false;
    }
}
