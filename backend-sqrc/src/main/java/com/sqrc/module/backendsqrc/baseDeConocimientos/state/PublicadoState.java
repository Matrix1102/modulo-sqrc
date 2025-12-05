package com.sqrc.module.backendsqrc.baseDeConocimientos.state;

import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.TransicionEstadoException;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;

import java.time.LocalDateTime;

/**
 * Estado PUBLICADO: La versión está activa y visible para los agentes.
 * 
 * Transiciones válidas:
 * - archivar() → ARCHIVADO (cuando se publica una nueva versión)
 * - deprecar() → DEPRECADO (cuando expira la vigencia)
 * 
 * Características:
 * - No puede ser editada (crear nueva versión en su lugar)
 * - Es visible para agentes según la visibilidad del artículo
 */
public class PublicadoState implements EstadoArticuloState {

    private static final PublicadoState INSTANCE = new PublicadoState();

    private PublicadoState() {
    }

    public static PublicadoState getInstance() {
        return INSTANCE;
    }

    @Override
    public EstadoArticulo getEstado() {
        return EstadoArticulo.PUBLICADO;
    }

    @Override
    public EstadoArticuloState proponer(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.PUBLICADO,
                EstadoArticulo.PROPUESTO,
                "Una versión publicada no puede ser propuesta. Cree una nueva versión.");
    }

    @Override
    public EstadoArticuloState publicar(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.PUBLICADO,
                EstadoArticulo.PUBLICADO,
                "La versión ya está publicada");
    }

    @Override
    public EstadoArticuloState rechazar(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.PUBLICADO,
                EstadoArticulo.RECHAZADO,
                "No se puede rechazar una versión que ya está publicada");
    }

    @Override
    public EstadoArticuloState archivar(ArticuloVersion version) {
        // Transición válida: PUBLICADO → ARCHIVADO
        version.setEstadoPropuestaInterno(EstadoArticulo.ARCHIVADO);
        version.setEsVigente(false);
        if (version.getArticulo() != null) {
            version.getArticulo().setVigenteHasta(LocalDateTime.now());
        }
        return ArchivadoState.getInstance();
    }

    @Override
    public EstadoArticuloState deprecar(ArticuloVersion version) {
        // Transición válida: PUBLICADO → DEPRECADO
        version.setEstadoPropuestaInterno(EstadoArticulo.DEPRECADO);
        version.setEsVigente(false);
        return DeprecadoState.getInstance();
    }

    @Override
    public EstadoArticuloState volverABorrador(ArticuloVersion version) {
        throw new TransicionEstadoException(
                EstadoArticulo.PUBLICADO,
                EstadoArticulo.BORRADOR,
                "Una versión publicada no puede volver a borrador. Cree una nueva versión.");
    }

    @Override
    public boolean puedeEditar() {
        return false; // Crear nueva versión en su lugar
    }

    @Override
    public boolean esVisible() {
        return true;
    }
}
