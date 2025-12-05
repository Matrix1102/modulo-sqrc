package com.sqrc.module.backendsqrc.baseDeConocimientos.state;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;

/**
 * Interfaz del patrón State para manejar las transiciones de estado
 * de las versiones de artículos en la Base de Conocimientos.
 * 
 * Cada estado concreto implementa las transiciones válidas desde su estado.
 * Las transiciones no válidas lanzan TransicionEstadoException.
 * 
 * Diagrama de transiciones:
 * 
 * BORRADOR ──────► PROPUESTO ──────► PUBLICADO ──────► ARCHIVADO
 * ▲ │ │
 * │ ▼ │
 * └────────── RECHAZADO │
 * ▼
 * DEPRECADO
 */
public interface EstadoArticuloState {

    /**
     * Retorna el enum correspondiente a este estado.
     */
    EstadoArticulo getEstado();

    /**
     * Propone la versión para revisión del supervisor.
     * Transición válida: BORRADOR → PROPUESTO
     * 
     * @param version La versión del artículo
     * @return El nuevo estado después de la transición
     */
    EstadoArticuloState proponer(ArticuloVersion version);

    /**
     * Publica la versión haciéndola vigente.
     * Transición válida: PROPUESTO → PUBLICADO
     * 
     * @param version La versión del artículo
     * @return El nuevo estado después de la transición
     */
    EstadoArticuloState publicar(ArticuloVersion version);

    /**
     * Rechaza la versión propuesta.
     * Transición válida: PROPUESTO → RECHAZADO
     * 
     * @param version La versión del artículo
     * @return El nuevo estado después de la transición
     */
    EstadoArticuloState rechazar(ArticuloVersion version);

    /**
     * Archiva la versión (ya no es la vigente).
     * Transición válida: PUBLICADO → ARCHIVADO
     * 
     * @param version La versión del artículo
     * @return El nuevo estado después de la transición
     */
    EstadoArticuloState archivar(ArticuloVersion version);

    /**
     * Marca la versión como deprecada (expirada).
     * Transición válida: PUBLICADO → DEPRECADO
     * 
     * @param version La versión del artículo
     * @return El nuevo estado después de la transición
     */
    EstadoArticuloState deprecar(ArticuloVersion version);

    /**
     * Vuelve a borrador para edición (crear nueva versión basada en esta).
     * Transición válida: RECHAZADO → BORRADOR
     * 
     * @param version La versión del artículo
     * @return El nuevo estado después de la transición
     */
    EstadoArticuloState volverABorrador(ArticuloVersion version);

    /**
     * Indica si la versión puede ser editada en este estado.
     */
    default boolean puedeEditar() {
        return false;
    }

    /**
     * Indica si la versión es visible para los agentes en este estado.
     */
    default boolean esVisible() {
        return false;
    }

    /**
     * Obtiene el nombre legible del estado.
     */
    default String getNombreEstado() {
        return getEstado().name();
    }
}
