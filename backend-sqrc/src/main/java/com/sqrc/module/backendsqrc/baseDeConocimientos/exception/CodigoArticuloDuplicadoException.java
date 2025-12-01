package com.sqrc.module.backendsqrc.baseDeConocimientos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Excepción lanzada cuando ya existe un artículo con el código dado.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class CodigoArticuloDuplicadoException extends RuntimeException {

    public CodigoArticuloDuplicadoException(String codigo) {
        super("Ya existe un artículo con el código: " + codigo);
    }
}
