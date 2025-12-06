package com.sqrc.module.backendsqrc.encuesta.event;

/**
 * Evento publicado al cerrar un ticket para solicitar la creación de la encuesta
 * después del commit de la transacción que cerró el ticket.
 */
public record TicketClosedForEncuestaEvent(Long plantillaId, Long ticketId, Integer clienteId) {
}
