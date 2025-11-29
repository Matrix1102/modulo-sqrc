package com.sqrc.module.backendsqrc.vista360.exception;

/**
 * Excepción personalizada lanzada cuando no se encuentra un cliente en el sistema.
 */
public class ClienteNotFoundException extends RuntimeException {

    public ClienteNotFoundException(String mensaje) {
        super(mensaje);
    }

    public ClienteNotFoundException(Integer idCliente) {
        super("Cliente con ID " + idCliente + " no encontrado");
    }

    public ClienteNotFoundException(String campo, String valor) {
        super("Cliente con " + campo + " '" + valor + "' no encontrado");
    }
}
