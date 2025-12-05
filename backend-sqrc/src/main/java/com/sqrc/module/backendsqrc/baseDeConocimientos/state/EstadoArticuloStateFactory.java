package com.sqrc.module.backendsqrc.baseDeConocimientos.state;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;

/**
 * Fábrica para obtener la instancia correcta del estado basado en el enum.
 * Utiliza el patrón Singleton para cada estado (Flyweight).
 */
public class EstadoArticuloStateFactory {

    private EstadoArticuloStateFactory() {
        // Utility class
    }

    /**
     * Obtiene la instancia del estado correspondiente al enum.
     * 
     * @param estado El enum del estado
     * @return La instancia del estado concreto
     */
    public static EstadoArticuloState getState(EstadoArticulo estado) {
        if (estado == null) {
            return BorradorState.getInstance();
        }

        return switch (estado) {
            case BORRADOR -> BorradorState.getInstance();
            case PROPUESTO -> PropuestoState.getInstance();
            case PUBLICADO -> PublicadoState.getInstance();
            case RECHAZADO -> RechazadoState.getInstance();
            case ARCHIVADO -> ArchivadoState.getInstance();
            case DEPRECADO -> DeprecadoState.getInstance();
        };
    }
}
