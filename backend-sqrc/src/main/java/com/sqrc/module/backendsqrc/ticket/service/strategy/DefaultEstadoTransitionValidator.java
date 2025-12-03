package com.sqrc.module.backendsqrc.ticket.service.strategy;

import com.sqrc.module.backendsqrc.ticket.model.EstadoTicket;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Implementación del validador de transiciones de estado.
 * 
 * Patrón: Strategy (implementación concreta)
 * 
 * Reglas de Negocio - Transiciones Válidas:
 * 
 * ABIERTO:
 *   -> ESCALADO (Agente escala a BackOffice)
 *   -> CERRADO (Agente resuelve directamente)
 * 
 * ESCALADO:
 *   -> DERIVADO (BackOffice deriva a área especializada)
 *   -> ABIERTO (BackOffice rechaza y devuelve a Agente)
 *   -> CERRADO (BackOffice resuelve)
 * 
 * DERIVADO:
 *   -> ESCALADO (Área rechaza y devuelve a BackOffice)
 *   -> CERRADO (Área especializada resuelve)
 * 
 * CERRADO:
 *   -> (No permite transiciones - estado final)
 */
@Component
public class DefaultEstadoTransitionValidator implements EstadoTransitionValidator {

    /**
     * Mapa de transiciones válidas.
     * Key: Estado actual
     * Value: Set de estados a los que puede transicionar
     */
    private static final Map<EstadoTicket, Set<EstadoTicket>> TRANSICIONES_VALIDAS;

    static {
        TRANSICIONES_VALIDAS = new EnumMap<>(EstadoTicket.class);

        // Desde ABIERTO
        TRANSICIONES_VALIDAS.put(EstadoTicket.ABIERTO, 
            Set.of(EstadoTicket.ESCALADO, EstadoTicket.CERRADO));

        // Desde ESCALADO
        TRANSICIONES_VALIDAS.put(EstadoTicket.ESCALADO, 
            Set.of(EstadoTicket.DERIVADO, EstadoTicket.ABIERTO, EstadoTicket.CERRADO));

        // Desde DERIVADO
        TRANSICIONES_VALIDAS.put(EstadoTicket.DERIVADO, 
            Set.of(EstadoTicket.ESCALADO, EstadoTicket.CERRADO));

        // Desde CERRADO (no hay transiciones válidas)
        TRANSICIONES_VALIDAS.put(EstadoTicket.CERRADO, 
            Collections.emptySet());
    }

    @Override
    public boolean esTransicionValida(EstadoTicket estadoActual, EstadoTicket estadoNuevo) {
        if (estadoActual == null || estadoNuevo == null) {
            return false;
        }

        // Mismo estado no es una transición
        if (estadoActual == estadoNuevo) {
            return false;
        }

        Set<EstadoTicket> estadosPermitidos = TRANSICIONES_VALIDAS.get(estadoActual);
        return estadosPermitidos != null && estadosPermitidos.contains(estadoNuevo);
    }

    @Override
    public String getMensajeError(EstadoTicket estadoActual, EstadoTicket estadoNuevo) {
        if (estadoActual == estadoNuevo) {
            return String.format("El ticket ya se encuentra en estado %s", estadoActual);
        }

        if (estadoActual == EstadoTicket.CERRADO) {
            return "No se puede cambiar el estado de un ticket cerrado";
        }

        Set<EstadoTicket> permitidos = TRANSICIONES_VALIDAS.get(estadoActual);
        if (permitidos == null || permitidos.isEmpty()) {
            return String.format("No hay transiciones válidas desde el estado %s", estadoActual);
        }

        return String.format(
            "Transición no permitida: %s -> %s. Estados válidos desde %s: %s",
            estadoActual, estadoNuevo, estadoActual, permitidos
        );
    }

    /**
     * Obtiene los estados a los que puede transicionar desde el estado actual.
     * 
     * @param estadoActual Estado actual del ticket
     * @return Set de estados permitidos
     */
    public Set<EstadoTicket> getTransicionesPermitidas(EstadoTicket estadoActual) {
        return TRANSICIONES_VALIDAS.getOrDefault(estadoActual, Collections.emptySet());
    }

    /**
     * Verifica si un ticket puede ser escalado (requiere estado ABIERTO).
     */
    public boolean puedeEscalar(EstadoTicket estadoActual) {
        return estadoActual == EstadoTicket.ABIERTO;
    }

    /**
     * Verifica si un ticket puede ser derivado (requiere estado ESCALADO).
     */
    public boolean puedeDerivar(EstadoTicket estadoActual) {
        return estadoActual == EstadoTicket.ESCALADO;
    }

    /**
     * Verifica si un ticket puede ser cerrado.
     */
    public boolean puedeCerrar(EstadoTicket estadoActual) {
        return estadoActual != EstadoTicket.CERRADO;
    }

    /**
     * Verifica si un ticket puede ser devuelto al estado anterior.
     */
    public boolean puedeDevolver(EstadoTicket estadoActual) {
        return estadoActual == EstadoTicket.ESCALADO || estadoActual == EstadoTicket.DERIVADO;
    }
}
