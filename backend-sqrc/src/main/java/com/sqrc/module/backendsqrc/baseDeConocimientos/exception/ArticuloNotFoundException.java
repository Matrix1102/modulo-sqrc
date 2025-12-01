package com.sqrc.module.backendsqrc.baseDeConocimientos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Excepción lanzada cuando no se encuentra un artículo.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ArticuloNotFoundException extends RuntimeException {

    public ArticuloNotFoundException(String mensaje) {
        super(mensaje);
    }

    public ArticuloNotFoundException(Integer id) {
        super("Artículo no encontrado con ID: " + id);
    }

    public ArticuloNotFoundException(String campo, String valor) {
        super("Artículo no encontrado con " + campo + ": " + valor);
    }
}
