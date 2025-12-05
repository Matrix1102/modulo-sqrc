package com.sqrc.module.backendsqrc.baseDeConocimientos.observer;

import com.sqrc.module.backendsqrc.baseDeConocimientos.observer.event.ArticuloEvent;

/**
 * Observer Pattern - Interfaz para observadores de eventos de artículos.
 * 
 * <p>
 * Define el contrato que deben implementar todos los observadores
 * que deseen recibir notificaciones sobre eventos de artículos.
 * </p>
 * 
 * <p>
 * <b>Eventos soportados:</b>
 * </p>
 * <ul>
 * <li>Artículo creado</li>
 * <li>Artículo publicado</li>
 * <li>Versión creada</li>
 * <li>Versión propuesta para revisión</li>
 * <li>Versión rechazada</li>
 * <li>Artículo archivado</li>
 * </ul>
 * 
 * @see ArticuloEvent
 * @see ArticuloEventPublisher
 */
public interface IArticuloObserver {

    /**
     * Método llamado cuando ocurre un evento de artículo.
     * 
     * @param evento El evento que ocurrió
     */
    void onArticuloEvent(ArticuloEvent evento);

    /**
     * Indica el orden de prioridad del observer.
     * Observers con menor número se ejecutan primero.
     * 
     * @return Prioridad del observer (menor = más prioritario)
     */
    default int getPrioridad() {
        return 100; // Prioridad por defecto
    }

    /**
     * Indica si el observer debe ejecutarse de forma asíncrona.
     * 
     * @return true si debe ser asíncrono, false si es síncrono
     */
    default boolean esAsincrono() {
        return false;
    }
}
