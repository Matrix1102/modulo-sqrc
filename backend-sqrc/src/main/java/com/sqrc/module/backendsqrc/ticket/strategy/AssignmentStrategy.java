package com.sqrc.module.backendsqrc.ticket.strategy;

/**
 * Interfaz Strategy para definir diferentes algoritmos de asignación de tickets.
 * Permite elegir automáticamente el mejor agente para un área específica.
 */
public interface AssignmentStrategy {

    /**
     * Encuentra el ID del mejor agente disponible para el área destino.
     *
     * @param areaDestino Nombre del área a la que se asigna el ticket
     * @return ID del empleado/agente seleccionado
     */
    Long findBestAgentId(String areaDestino);
}

