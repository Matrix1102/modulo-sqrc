package com.sqrc.module.backendsqrc.ticket.exception;

/**
 * Excepción lanzada cuando no se encuentra un cliente.
 * 
 * Patrón: Custom Exception
 */
public class ClienteNotFoundException extends RuntimeException {

    private final Integer clienteId;

    public ClienteNotFoundException(Integer clienteId) {
        super("Cliente no encontrado con ID: " + clienteId);
        this.clienteId = clienteId;
    }

    public ClienteNotFoundException(String message) {
        super(message);
        this.clienteId = null;
    }

    public Integer getClienteId() {
        return clienteId;
    }
}
