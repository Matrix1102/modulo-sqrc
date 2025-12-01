package com.sqrc.module.backendsqrc.baseDeConocimientos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Excepción lanzada cuando una operación de negocio no es válida.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class OperacionInvalidaException extends RuntimeException {

    public OperacionInvalidaException(String mensaje) {
        super(mensaje);
    }
}
