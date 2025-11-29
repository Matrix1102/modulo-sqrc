package com.sqrc.module.backendsqrc.encuesta.event;

/**
 * Evento simple publicado cuando se cierra un ticket.
 * - `ticketId` puede usarse para auditoría.
 * - `encuestaId` debe indicarse si ya existe la encuesta asociada.
 * - `clienteId` opcional para resolver el correo en `Vista360Service`.
 */
public record TicketClosedEvent(Long ticketId, Long encuestaId, Integer clienteId) {
}
