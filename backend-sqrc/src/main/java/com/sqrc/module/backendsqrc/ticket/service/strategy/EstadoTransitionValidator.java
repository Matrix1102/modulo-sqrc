package com.sqrc.module.backendsqrc.ticket.service.strategy;

import com.sqrc.module.backendsqrc.ticket.model.EstadoTicket;

/**
 * Interfaz para validar transiciones de estado.
 * 
 * Patrón: Strategy
 * - Define una familia de algoritmos de validación
 * - Encapsula cada uno y los hace intercambiables
 * - Permite que el algoritmo varíe independientemente de los clientes que lo usan
 */
public interface EstadoTransitionValidator {

    /**
     * Valida si la transición de estado es permitida.
     * 
     * @param estadoActual Estado actual del ticket
     * @param estadoNuevo Estado al que se quiere transicionar
     * @return true si la transición es válida
     */
    boolean esTransicionValida(EstadoTicket estadoActual, EstadoTicket estadoNuevo);

    /**
     * Obtiene el mensaje de error para una transición inválida.
     * 
     * @param estadoActual Estado actual del ticket
     * @param estadoNuevo Estado al que se quiere transicionar
     * @return Mensaje descriptivo del error
     */
    String getMensajeError(EstadoTicket estadoActual, EstadoTicket estadoNuevo);
}
